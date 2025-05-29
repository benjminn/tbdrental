'use client';
import { cn } from '../../lib/utils'; // Optional utility for class merging

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent', sizeClasses[size], className)} 
      role="status"
      style={{ animationDuration: '1s' }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;