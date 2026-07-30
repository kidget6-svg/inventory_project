import React from 'react';

const colorMap = {
    blue: { border: 'border-l-sky-500', text: 'text-sky-700' },
    green: { border: 'border-l-emerald-500', text: 'text-emerald-700' },
    orange: { border: 'border-l-amber-500', text: 'text-amber-600' },
    red: { border: 'border-l-red-500', text: 'text-red-600' },
    yellow: { border: 'border-l-yellow-500', text: 'text-yellow-700' },
    purple: { border: 'border-l-purple-500', text: 'text-purple-700' },
    sky: { border: 'border-l-sky-500', text: 'text-sky-700' },
};

export default function StatCard({ value, label, color = 'sky' }) {
    const c = colorMap[color] || colorMap.sky;

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-sky-100/80 border-l-4 ${c.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            <div className={`text-3xl font-bold tracking-tight ${c.text}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
        </div>
    );
}
