// src/components/ui/LoadingSpinner.tsx
import React from 'react';

export type LoadingSpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  className?: string;
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  color = 'blue' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-gray-200 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
  };

  const selectedColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-solid ${selectedColorClass}`}
      ></div>
    </div>
  );
}