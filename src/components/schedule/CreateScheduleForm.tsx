import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';
import { useScheduleStore } from '../../stores/scheduleStore';
import { ViewType } from '../../types';

interface CreateScheduleFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { currentView, selectedDate } = useScheduleStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Schedule name is required');
      return;
    }

    onSubmit(name.trim());
  };

  const handleCancel = () => {
    setName('');
    setError('');
    onCancel();
  }

  const getPeriodText = () => {
    switch (currentView) {
      case ViewType.DAY:
        return `for ${selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`;
      case ViewType.WEEK:
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `for week of ${weekStart.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric'
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}`;
      case ViewType.MONTH:
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return `for ${selectedDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })} (${monthStart.toLocaleDateString('en-US', {
          day: 'numeric'
        })} - ${monthEnd.toLocaleDateString('en-US', {
          day: 'numeric'
        })})`;
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Create New Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Schedule Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Work Week, Study Plan, Vacation, etc."
            error={error}
            required
          />
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Creating schedule {getPeriodText()}</strong>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              When selected, this schedule will automatically switch to the {currentView} view
              {currentView !== ViewType.DAY && ' with the appropriate date range'}.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Create Schedule
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateScheduleForm;
