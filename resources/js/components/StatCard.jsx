import React from 'react';

export default function StatCard({ value, label, color = 'blue' }) {
    const colors = {
        blue: 'border-l-blue-500 text-blue-700',
        green: 'border-l-green-500 text-green-700',
        orange: 'border-l-orange-500 text-orange-700',
        red: 'border-l-red-500 text-red-700',
        yellow: 'border-l-yellow-500 text-yellow-700',
        purple: 'border-l-purple-500 text-purple-700',
        indigo: 'border-l-indigo-500 text-indigo-700',
    };

    return (
        <div
            className={`relative overflow-hidden bg-white rounded-xl shadow p-6 border-l-4 ${
                colors[color] || colors.blue
            }`}
        >
            {/* Background circle */}
            <div
                className="
                    absolute
                    top-0
                    right-0
                    w-32
                    h-32
                    rounded-full
                    bg-gray-200
                    opacity-10
                    blur-xl
                    translate-x-10
                    -translate-y-10
                "
            />

            <div className="relative z-10">
                <p className="text-sm text-gray-500">{label}</p>
                <h2 className="text-3xl font-bold mt-2">{value}</h2>
            </div>
        </div>
    );
}
