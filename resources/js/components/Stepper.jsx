import React from 'react';
import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {steps.map((step, i) => {
                const isCompleted = i < currentStep;
                const isCurrent = i === currentStep;
                const isLast = i === steps.length - 1;

                return (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 ${
                                isCompleted
                                    ? 'bg-sky-500 text-white shadow-sm'
                                    : isCurrent
                                        ? 'bg-sky-100 text-sky-700 border-2 border-sky-500'
                                        : 'bg-gray-100 text-gray-400'
                            }`}>
                                {isCompleted ? <Check size={18} /> : i + 1}
                            </div>
                            <span className={`text-sm font-semibold hidden sm:block ${isCurrent ? 'text-sky-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-sky-500' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
