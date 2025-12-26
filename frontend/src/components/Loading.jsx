import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const LoadingSpinner = ({ className, size = 24 }) => (
    <div className={cn("flex items-center justify-center p-12 w-full", className)}>
        <Loader2 
            size={size} 
            className="text-primary animate-spin opacity-40" 
        />
    </div>
);

export const LoadingRow = ({ colSpan }) => (
    <tr>
        <td colSpan={colSpan} className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary opacity-20" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">Chargement des données...</p>
            </div>
        </td>
    </tr>
);

export default LoadingSpinner;

