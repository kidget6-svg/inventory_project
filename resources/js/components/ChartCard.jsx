import React from "react";

export default function ChartCard({
    title,
    description,
    action,
    children,
    className = "",
}) {
    return (
        <div
            className={`
                bg-white dark:bg-slate-800
                rounded-2xl
                border border-gray-200 dark:border-slate-700
                shadow-sm
                ${className}
            `}
        >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">

                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {title}
                    </h2>

                    {description && (
                        <p className="text-gray-500 dark:text-slate-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>

                {action}
            </div>

            {/* Body */}

            <div className="p-8">
                {children}
            </div>

        </div>
    );
}
