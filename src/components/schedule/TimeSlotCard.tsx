import React from 'react';
import { Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { TimeSlot } from '../../types';
import { Card, CardContent } from '../ui/Card';
import {
  formatTimeForDisplay,
  formatDuration,
  calculateDuration,
} from '../../utils/time-utils';
import { CategoryBadge, PriorityBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  hasConflict?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  hover?: boolean;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  timeSlot,
  hasConflict = false,
  onEdit,
  onDelete,
}) => {
  const {
    id,
    title,
    startTime,
    endTime,
    category,
    description,
    location,
    priority,
  } = timeSlot;

  const duration = calculateDuration(startTime, endTime);

  return (
    <Card
      className={cn(
        'mb-4 transition-all duration-200 hover:shadow-md',
        hasConflict && 'border-l-4 border-l-error-500',
      )}
      hover
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {formatTimeForDisplay(startTime)} -{' '}
                {formatTimeForDisplay(endTime)} ({formatDuration(duration)})
              </span>
            </div>

            {location && (
              <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{location}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(id)}
              aria-label="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete && onDelete(id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryBadge category={category} />
          {priority && <PriorityBadge priority={priority} />}
          {hasConflict && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              Conflict
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotCard;
