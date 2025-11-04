import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Lock, AlertCircle } from 'lucide-react';
import { TimeSlot, Category, Priority } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';
import { calculateDuration } from '../../utils/time-utils';

interface TimeSlotFormProps {
  timeSlot?: TimeSlot;
  onSubmit: (timeSlot: Omit<TimeSlot, 'id'>) => void;
  onCancel: () => void;
  defaultDate?: string;
  availableDates?: string[];
  forceDate?: boolean;
  minDate?: string; // НОВЫЙ ПРОПС: минимальная доступная дата
  maxDate?: string; // НОВЫЙ ПРОПС: максимальная доступная дата
}

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({
  timeSlot,
  onSubmit,
  onCancel,
  defaultDate,
  availableDates = [],
  forceDate = false,
  minDate,
  maxDate,
}) => {
  const [title, setTitle] = useState(timeSlot?.title || '');
  const [startTime, setStartTime] = useState(timeSlot?.startTime || '09:00');
  const [endTime, setEndTime] = useState(timeSlot?.endTime || '10:00');
  const [date, setDate] = useState(
    timeSlot?.date || defaultDate || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<Category>(
    timeSlot?.category || Category.WORK,
  );
  const [priority, setPriority] = useState<Priority | undefined>(
    timeSlot?.priority,
  );
  const [description, setDescription] = useState(timeSlot?.description || '');
  const [location, setLocation] = useState(timeSlot?.location || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = [
    { value: Category.WORK, label: 'Work' },
    { value: Category.STUDY, label: 'Study' },
    { value: Category.PERSONAL, label: 'Personal' },
    { value: Category.HEALTH, label: 'Health' },
    { value: Category.LEISURE, label: 'Leisure' },
    { value: Category.OTHER, label: 'Other' },
  ];

  const priorityOptions = [
    { value: '', label: 'No priority' },
    { value: Priority.HIGH, label: 'High' },
    { value: Priority.MEDIUM, label: 'Medium' },
    { value: Priority.LOW, label: 'Low' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (startTime && endTime) {
      const duration = calculateDuration(startTime, endTime);
      if (duration <= 0) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    // ПРОВЕРКА ДАТЫ НА СООТВЕТСТВИЕ ПЕРИОДУ
    if (minDate && maxDate && (date < minDate || date > maxDate)) {
      newErrors.date = `Date must be between ${formatDisplayDate(minDate)} and ${formatDisplayDate(maxDate)}`;
    }

    // Дополнительная проверка по availableDates
    if (availableDates.length > 0 && !availableDates.includes(date)) {
      newErrors.date = 'Selected date is not available in current view';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Функция для форматирования даты для отображения
  const formatDisplayDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newTimeSlot: Omit<TimeSlot, 'id'> = {
      title,
      startTime,
      endTime,
      date,
      category,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      priority: priority || undefined,
    };

    onSubmit(newTimeSlot);
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>
          {timeSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting, Study, Exercise, etc."
            error={errors.title}
            required
          />

          {/* ОБНОВЛЕННОЕ ПОЛЕ: Дата с полными ограничениями */}
          <div className="space-y-2">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Date 
              {forceDate && <span className="text-xs text-gray-500 ml-1">(Fixed for current day)</span>}
              {minDate && maxDate && !forceDate && (
                <span className="text-xs text-gray-500 ml-1">
                  ({formatDisplayDate(minDate)} - {formatDisplayDate(maxDate)})
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                icon={forceDate ? <Lock className="h-4 w-4 text-gray-500" /> : <Calendar className="h-4 w-4 text-gray-500" />}
                error={errors.date}
                required
                disabled={forceDate}
                // ОГРАНИЧЕНИЯ ЧЕРЕЗ MIN/MAX АТРИБУТЫ
                min={minDate}
                max={maxDate}
              />
              {forceDate && (
                <div className="absolute inset-y-0 right-8 flex items-center">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              )}
              {minDate && maxDate && !forceDate && (
                <div className="absolute inset-y-0 right-8 flex items-center">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
            {minDate && maxDate && !forceDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available period: {formatDisplayDate(minDate)} - {formatDisplayDate(maxDate)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              icon={<Clock className="h-4 w-4 text-gray-500" />}
              error={errors.startTime}
              required
            />

            <Input
              type="time"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              icon={<Clock className="h-4 w-4 text-gray-500" />}
              error={errors.endTime}
              required
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            options={categoryOptions}
          />

          <Select
            label="Priority (Optional)"
            value={priority || ''}
            onChange={(e) =>
              setPriority(
                e.target.value ? (e.target.value as Priority) : undefined,
              )
            }
            options={priorityOptions}
          />

          <Input
            label="Location (Optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Room, Building, Online, etc."
            icon={<MapPin className="h-4 w-4 text-gray-500" />}
          />

          <div className="space-y-1">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500"
              placeholder="Additional details about this time slot"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{timeSlot ? 'Update' : 'Create'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TimeSlotForm;
