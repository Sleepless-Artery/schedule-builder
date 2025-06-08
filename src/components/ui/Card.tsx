import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export const Card = ({
  className,
  children,
  onClick,
  hover = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader = ({ className, children }: CardHeaderProps) => {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
        className,
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle = ({ className, children }: CardTitleProps) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-white',
        className,
      )}
    >
      {children}
    </h3>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent = ({ className, children }: CardContentProps) => {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter = ({ className, children }: CardFooterProps) => {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700',
        className,
      )}
    >
      {children}
    </div>
  );
};
