import React from 'react';
import { cn } from '../../utils/cn';
import { Category, Priority } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  color,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

  const defaultColor = 'bg-gray-100 text-gray-800';
  const outlineColor = 'bg-transparent border border-gray-200 text-gray-800';

  const customDefaultColor = color
    ? `bg-${color}-100 text-${color}-800`
    : defaultColor;
  const customOutlineColor = color
    ? `bg-transparent border border-${color}-200 text-${color}-800`
    : outlineColor;

  const variantStyles =
    variant === 'default' ? customDefaultColor : customOutlineColor;

  return (
    <span className={cn(baseStyles, variantStyles, className)} {...props}>
      {children}
    </span>
  );
};

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className,
}) => {
  const categoryColors = {
    [Category.WORK]: 'bg-blue-100 text-blue-800',
    [Category.STUDY]: 'bg-purple-100 text-purple-800',
    [Category.PERSONAL]: 'bg-green-100 text-green-800',
    [Category.HEALTH]: 'bg-teal-100 text-teal-800',
    [Category.LEISURE]: 'bg-amber-100 text-amber-800',
    [Category.OTHER]: 'bg-gray-100 text-gray-800',
  };

  const categoryLabels = {
    [Category.WORK]: 'Work',
    [Category.STUDY]: 'Study',
    [Category.PERSONAL]: 'Personal',
    [Category.HEALTH]: 'Health',
    [Category.LEISURE]: 'Leisure',
    [Category.OTHER]: 'Other',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        categoryColors[category],
        className,
      )}
    >
      {categoryLabels[category]}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
}) => {
  const priorityColors = {
    [Priority.HIGH]: 'bg-red-100 text-red-800',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [Priority.LOW]: 'bg-green-100 text-green-800',
  };

  const priorityLabels = {
    [Priority.HIGH]: 'High Priority',
    [Priority.MEDIUM]: 'Medium Priority',
    [Priority.LOW]: 'Low Priority',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        priorityColors[priority],
        className,
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
};
