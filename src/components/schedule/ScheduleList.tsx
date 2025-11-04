import React, { useState } from 'react';
import { Calendar, Plus, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { Schedule, ViewType } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface ScheduleListProps {
  schedules: Schedule[];
  currentScheduleId: string | null;
  onSelectSchedule: (id: string) => void;
  onCreateClick: () => void;
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  currentScheduleId,
  onSelectSchedule,
  onCreateClick,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleMenuToggle = (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === scheduleId ? null : scheduleId);
  };

  const handleEdit = (schedule: Schedule, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditSchedule(schedule);
    setMenuOpen(null);
  };

  const handleDelete = (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      onDeleteSchedule(scheduleId);
    }
    setMenuOpen(null);
  };

  const getSchedulePeriodText = (schedule: Schedule) => {
    const date = new Date(schedule.targetDate);
    switch (schedule.viewType) {
      case ViewType.DAY:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      case ViewType.WEEK:
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: weekStart.getFullYear() !== weekEnd.getFullYear() ? 'numeric' : undefined
        })}`;
      case ViewType.MONTH:
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Schedules</CardTitle>
        <Button size="sm" onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="h-10 w-10 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              No schedules yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onCreateClick}
            >
              Create your first schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`p-3 rounded-md cursor-pointer transition-colors relative group ${
                  schedule.id === currentScheduleId
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => onSelectSchedule(schedule.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {schedule.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {schedule.timeSlots.length} time slots • {schedule.viewType.toLowerCase()} schedule
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {getSchedulePeriodText(schedule)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(schedule.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleMenuToggle(schedule.id, e)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {menuOpen === schedule.id && (
                        <div className="absolute right-0 top-8 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[120px]">
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => handleEdit(schedule, e)}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => handleDelete(schedule.id, e)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleList;
