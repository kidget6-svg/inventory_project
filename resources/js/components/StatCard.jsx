import React from 'react';

export default function StatCard({ value, label, color = 'blue' }) {
    const colors = {
        blue: 'border-l-blue-500',
        green: 'border-l-green-500',
        orange: 'border-l-orange-500',
        red: 'border-l-red-500',
    };

    const textColors = {
        blue: 'text-blue-700',
        green: 'text-green-700',
        orange: 'text-orange-600',
        red: 'text-red-600',
    };

    return (
        <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${colors[color]} hover:-translate-y-0.5 transition-transform`}>
            <div className={`text-3xl font-bold ${textColors[color]}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
        </div>
    );
}
