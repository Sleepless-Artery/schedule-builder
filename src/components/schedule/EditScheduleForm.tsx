import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Schedule } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';

interface EditScheduleFormProps {
  schedule: Schedule;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const EditScheduleForm: React.FC<EditScheduleFormProps> = ({
  schedule,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(schedule.name);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Schedule name is required');
      return;
    }

    onSubmit(name.trim());
  };

  const handleCancel = () => {
    setName(schedule.name);
    setError('');
    onCancel();
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Edit Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Created: {new Date(schedule.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Time slots: {schedule.timeSlots.length}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || name === schedule.name}>
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditScheduleForm;
