import React from 'react';
import { Clock, MapPin, Edit, Trash2, Calendar } from 'lucide-react';
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
    date,
    category,
    description,
    location,
    priority,
  } = timeSlot;

  const duration = calculateDuration(startTime, endTime);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {formatTimeForDisplay(startTime)} - {formatTimeForDisplay(endTime)}
                </span>
              </div>
              
              <div>
                <span>({formatDuration(duration)})</span>
              </div>
            </div>

            {location && (
              <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-1 ml-2 flex-shrink-0">
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
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryBadge category={category} />
          {priority && <PriorityBadge priority={priority} />}
          {hasConflict && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Conflict
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotCard;
