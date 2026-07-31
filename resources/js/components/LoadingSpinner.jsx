import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 40, text = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={size} className="animate-spin text-sky-500" />
            <p className="text-gray-500 mt-4 text-sm font-medium">{text}</p>
        </div>
    );
}
