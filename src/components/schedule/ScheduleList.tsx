import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Schedule } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface ScheduleListProps {
  schedules: Schedule[];
  currentScheduleId: string | null;
  onSelectSchedule: (id: string) => void;
  onCreateClick: () => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  currentScheduleId,
  onSelectSchedule,
  onCreateClick,
}) => {
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
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  schedule.id === currentScheduleId
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => onSelectSchedule(schedule.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {schedule.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {schedule.timeSlots.length} time slots
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(schedule.updatedAt).toLocaleDateString()}
                  </span>
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
