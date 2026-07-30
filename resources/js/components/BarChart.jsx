import React from 'react';

export default function BarChart({
    title,
    labels = [],
    values = [],
    color = 'sky',
    valuePrefix = '',
    valueSuffix = '',
    currency = false,
}) {
    const colorMap = {
        sky: 'bg-sky-500 hover:bg-sky-600',
        indigo: 'bg-sky-500 hover:bg-sky-600',
        blue: 'bg-sky-500 hover:bg-sky-600',
        green: 'bg-emerald-500 hover:bg-emerald-600',
        orange: 'bg-amber-400 hover:bg-amber-500',
        red: 'bg-red-400 hover:bg-red-500',
        purple: 'bg-purple-500 hover:bg-purple-600',
    };
    const barColor = colorMap[color] || colorMap.sky;

    const maxValue = Math.max(...values, 1);

    const formatValue = (val) => {
        if (currency) return `$${Number(val).toFixed(2)}`;
        return `${valuePrefix}${Number(val)}${valueSuffix}`;
    };

    return (
        <div className="card p-5">
            <h3 className="card-header">{title}</h3>
            <div className="flex items-end justify-between gap-2 h-52">
                {labels.map((label, i) => {
                    const height = (values[i] / maxValue) * 100;
                    return (
                        <div key={i} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full flex justify-center">
                                <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-200 ${barColor} relative group-hover:brightness-110`}
                                    style={{ height: `${height}%`, minHeight: values[i] > 0 ? '4px' : '0' }}>
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg">
                                        {formatValue(values[i])}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between gap-2 mt-3">
                {labels.map((label, i) => (
                    <div key={i} className="flex-1 text-center">
                        <span className="text-xs text-gray-500 truncate block font-medium">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
