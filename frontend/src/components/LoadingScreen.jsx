import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enhanced Loading Spinner with smooth animation
 */
export const LoadingSpinner = ({ size = 24, className }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
        <Loader2
            size={size}
            className="animate-spin text-primary transition-all duration-300"
        />
        <div
            className="absolute inset-0 rounded-full border-2 border-primary/10"
            style={{ width: size, height: size }}
        />
    </div>
);

/**
 * Loading Row for Tables using Skeletons for better perceived performance
 */
export const LoadingRow = ({ colSpan, rows = 3 }) => (
    <>
        {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                <td colSpan={colSpan} className="p-4 align-middle">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                        <div className="hidden md:block space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                </td>
            </tr>
        ))}
    </>
);

/**
 * Premium Loading Screen with backdrop and polished aesthetics
 */
const LoadingScreen = ({ message = "Chargement des données...", className }) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center min-h-[400px] w-full p-8 transition-all animate-in fade-in duration-700",
            className
        )}>
            <div className="relative mb-6">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse" />

                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/10 rounded-full" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin absolute top-0 left-0" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center max-w-[280px]">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {message}
                </h3>
                <p className="text-sm text-muted-foreground animate-pulse">
                    Veuillez patienter un instant.
                </p>
            </div>

            {/* Progress dots footer */}
            <div className="mt-8 flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
            </div>
        </div>
    );
};

export default LoadingScreen;
