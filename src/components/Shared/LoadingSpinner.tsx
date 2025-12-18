import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
    className?: string;
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
    return (
        <div
            className={cn(
                "animate-spin rounded-full h-12 w-12 border-b-2 border-primary",
                className
            )}
        />
    );
};

export default LoadingSpinner;
