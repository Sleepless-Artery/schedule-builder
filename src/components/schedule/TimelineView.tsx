import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { TimeSlot, Schedule, ScheduleAnalysis } from '../../types';
import Button from '../ui/Button';
import TimeSlotCard from './TimeSlotCard';
import TimeSlotForm from './TimeSlotForm';
import { useScheduleStore } from '../../stores/scheduleStore';
import { ViewType } from '../../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface TimelineViewProps {
  schedule: Schedule;
  analysis: ScheduleAnalysis | null;
}

const TimelineView: React.FC<TimelineViewProps> = ({ schedule, analysis }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);

  const { addTimeSlot, updateTimeSlot, deleteTimeSlot, selectedDate, currentView } = useScheduleStore();

  const handleAddTimeSlot = (newTimeSlot: Omit<TimeSlot, 'id'>) => {
    addTimeSlot(newTimeSlot);
    setShowForm(false);
  };

  const handleUpdateTimeSlot = (updatedTimeSlot: Omit<TimeSlot, 'id'>) => {
    if (editingTimeSlot) {
      updateTimeSlot(editingTimeSlot.id, updatedTimeSlot);
      setShowForm(false);
      setEditingTimeSlot(null);
    }
  };

  const handleEditTimeSlot = (id: string) => {
    const timeSlot = schedule.timeSlots.find((slot) => slot.id === id);
    if (timeSlot) {
      setEditingTimeSlot(timeSlot);
      setShowForm(true);
    }
  };

  const handleDeleteTimeSlot = (id: string) => {
    deleteTimeSlot(id);
  };

  const conflictingSlotIds = new Set(
    analysis?.conflicts.flatMap((conflict) => [
      conflict.slotA.id,
      conflict.slotB.id,
    ]) || [],
  );

  const sortedTimeSlots = [...schedule.timeSlots].sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    return a.startTime.localeCompare(b.startTime);
  });

  // ОБНОВЛЕННАЯ ФУНКЦИЯ: возвращает min и max даты для ограничений
  const getDateConstraints = (): { minDate: string; maxDate: string; availableDates: string[] } => {
    switch (currentView) {
      case ViewType.DAY:
        const dayDate = selectedDate.toISOString().split('T')[0];
        return {
          minDate: dayDate,
          maxDate: dayDate,
          availableDates: [dayDate]
        };
      
      case ViewType.WEEK:
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
        const weekDates = weekDays.map(day => day.toISOString().split('T')[0]);
        return {
          minDate: weekDates[0],
          maxDate: weekDates[weekDates.length - 1],
          availableDates: weekDates
        };
      
      case ViewType.MONTH:
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const monthDates = monthDays.map(day => day.toISOString().split('T')[0]);
        return {
          minDate: monthDates[0],
          maxDate: monthDates[monthDates.length - 1],
          availableDates: monthDates
        };
      
      default:
        // Для custom или других видов - без ограничений
        const today = new Date().toISOString().split('T')[0];
        return {
          minDate: '',
          maxDate: '',
          availableDates: []
        };
    }
  };

  const getDefaultDate = (): string => {
    if (editingTimeSlot) {
      return editingTimeSlot.date;
    }
    
    switch (currentView) {
      case ViewType.DAY:
        return selectedDate.toISOString().split('T')[0];
      
      case ViewType.WEEK:
      case ViewType.MONTH:
      default:
        return selectedDate.toISOString().split('T')[0];
    }
  };

  const dateConstraints = getDateConstraints();
  const defaultDate = getDefaultDate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Timeline
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditingTimeSlot(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Time Slot
        </Button>
      </div>

      {analysis && analysis.conflicts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4 animate-pulse-gentle">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Schedule Conflicts Detected
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                <p>
                  There {analysis.conflicts.length === 1 ? 'is' : 'are'}{' '}
                  {analysis.conflicts.length} time slot{' '}
                  {analysis.conflicts.length === 1 ? 'conflict' : 'conflicts'}{' '}
                  in your schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="my-4 animate-fade-in">
          <TimeSlotForm
            timeSlot={editingTimeSlot || undefined}
            onSubmit={
              editingTimeSlot ? handleUpdateTimeSlot : handleAddTimeSlot
            }
            onCancel={() => {
              setShowForm(false);
              setEditingTimeSlot(null);
            }}
            defaultDate={defaultDate}
            // ПЕРЕДАЕМ ОГРАНИЧЕНИЯ ДАТ
            minDate={dateConstraints.minDate}
            maxDate={dateConstraints.maxDate}
            availableDates={dateConstraints.availableDates}
            forceDate={currentView === ViewType.DAY}
          />
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          {sortedTimeSlots.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No time slots added yet. Click the "Add Time Slot" button to
                get started.
              </p>
            </div>
          ) : (
            (() => {
              const slotsByDate: { [date: string]: TimeSlot[] } = {};
              
              sortedTimeSlots.forEach(slot => {
                if (!slotsByDate[slot.date]) {
                  slotsByDate[slot.date] = [];
                }
                slotsByDate[slot.date].push(slot);
              });

              return Object.entries(slotsByDate).map(([date, slots]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="space-y-2">
                    {slots.map((timeSlot) => (
                      <TimeSlotCard
                        key={timeSlot.id}
                        timeSlot={timeSlot}
                        hasConflict={conflictingSlotIds.has(timeSlot.id)}
                        onEdit={handleEditTimeSlot}
                        onDelete={handleDeleteTimeSlot}
                      />
                    ))}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineView;
