import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useScheduleStore } from '../stores/scheduleStore';
import { ViewType, Schedule } from '../types';

import Button from '../components/ui/Button';
import TimelineView from '../components/schedule/TimelineView';
import AnalysisPanel from '../components/schedule/AnalysisPanel';
import ScheduleList from '../components/schedule/ScheduleList';
import CreateScheduleForm from '../components/schedule/CreateScheduleForm';
import EditScheduleForm from '../components/schedule/EditScheduleForm';

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const {
    schedules,
    currentSchedule,
    currentView,
    selectedDate,
    setCurrentSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    analyzeCurrentSchedule,
    setSelectedDate,
  } = useScheduleStore();

  const handlePrevious = () => {
    const prevDate = new Date(selectedDate);
    switch (currentView) {
      case ViewType.DAY:
        prevDate.setDate(prevDate.getDate() - 1);
        break;
      case ViewType.WEEK:
        prevDate.setDate(prevDate.getDate() - 7);
        break;
      case ViewType.MONTH:
        prevDate.setMonth(prevDate.getMonth() - 1);
        break;
      default:
        break;
    }
    setSelectedDate(prevDate);
  };

  const handleNext = () => {
    const nextDate = new Date(selectedDate);
    switch (currentView) {
      case ViewType.DAY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case ViewType.WEEK:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case ViewType.MONTH:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        break;
    }
    setSelectedDate(nextDate);
  };

  const handleCreateSchedule = (name: string) => {
    createSchedule(name);
    setShowCreateForm(false);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
  };

  const handleUpdateSchedule = (name: string) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, { name });
      setEditingSchedule(null);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    deleteSchedule(id);
  };

  const getDateDisplay = () => {
    switch (currentView) {
      case ViewType.DAY:
        return format(selectedDate, 'MMMM d, yyyy');
      case ViewType.WEEK:
        const startOfWeek = new Date(selectedDate);
        const endOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d, yyyy')}`;
      case ViewType.MONTH:
        return format(selectedDate, 'MMMM yyyy');
      default:
        return format(selectedDate, 'MMMM d, yyyy');
    }
  };

  const analysis = currentSchedule ? analyzeCurrentSchedule() : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
          </div>

          {showCreateForm ? (
            <CreateScheduleForm 
              onSubmit={handleCreateSchedule}
              onCancel={() => setShowCreateForm(false)} 
            />
          ) : editingSchedule ? (
            <EditScheduleForm
              schedule={editingSchedule}
              onSubmit={handleUpdateSchedule}
              onCancel={() => setEditingSchedule(null)}
            />
          ) : (
            <ScheduleList
              schedules={schedules}
              currentScheduleId={currentSchedule?.id || null}
              onSelectSchedule={setCurrentSchedule}
              onCreateClick={() => setShowCreateForm(true)}
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {currentSchedule && <AnalysisPanel analysis={analysis} />}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="hidden lg:flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
          </div>

          {currentSchedule ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-500" />
                    <span className="text-lg font-medium">
                      {getDateDisplay()}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <TimelineView schedule={currentSchedule} analysis={analysis} />
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Schedule Selected
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Select an existing schedule or create a new one to get started.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create New Schedule
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
