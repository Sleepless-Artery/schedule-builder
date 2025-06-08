import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';

interface CreateScheduleFormProps {
  onSubmit: (name: string) => void;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Schedule name is required');
      return;
    }

    onSubmit(name.trim());
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
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="submit" disabled={!name.trim()}>
            Create Schedule
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateScheduleForm;
