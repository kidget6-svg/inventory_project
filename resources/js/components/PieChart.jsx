import React from 'react';

/**
 * A lightweight, dependency-free pie/donut chart using CSS conic-gradient.
 *
 * @param {string} title       - Chart heading
 * @param {string[]} labels    - Category labels
 * @param {number[]} values    - Values for each slice
 * @param {string[]} colors    - Tailwind color classes for each slice (e.g. 'bg-blue-500')
 */
export default function PieChart({ title, labels = [], values = [], colors = [] }) {
    const total = values.reduce((sum, v) => sum + Number(v), 0);

    // Build conic-gradient segments
    const segments = [];
    let cumulative = 0;
    const colorPalette = [
        'bg-blue-500', 'bg-green-500', 'bg-orange-400', 'bg-red-400',
        'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
        'bg-amber-500', 'bg-cyan-500',
    ];

    labels.forEach((label, i) => {
        const pct = total > 0 ? (Number(values[i]) / total) * 100 : 0;
        cumulative += pct;
        const color = colors[i] || colorPalette[i % colorPalette.length];
        // Extract the hex/tailwind color — we'll use a data attribute approach
        // For simplicity, use inline style with a predefined color map
        const colorHex = tailwindToHex(color);
        segments.push(`${colorHex} 0% ${pct === 0 ? 0 : cumulative - pct}%`);
    });

    // If only one non-zero slice, make it a full circle
    const nonZeroCount = values.filter(v => Number(v) > 0).length;
    let gradient;
    if (nonZeroCount <= 1) {
        const idx = values.findIndex(v => Number(v) > 0);
        const color = colors[idx] || colorPalette[0];
        gradient = tailwindToHex(color);
    } else {
        gradient = `conic-gradient(${segments.join(', ')})`;
    }

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-700 mb-4">{title}</h3>

            <div className="flex items-center gap-6 flex-wrap">
                {/* Donut chart */}
                <div className="relative">
                    <div
                        className="w-32 h-32 rounded-full"
                        style={{ background: gradient }}
                    />
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-700">{total}</span>
                        <span className="text-xs text-gray-500">total units</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                    {labels.map((label, i) => {
                        const val = Number(values[i]);
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                        const color = colors[i] || colorPalette[i % colorPalette.length];
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{label}</span>
                                    <span className="text-xs text-gray-400">{val} units ({pct}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Map common Tailwind bg colors to hex for conic-gradient
const tailwindToHex = (cls) => {
    const map = {
        'bg-blue-500': '#3b82f6',
        'bg-green-500': '#22c55e',
        'bg-orange-400': '#fb9225',
        'bg-red-400': '#f87171',
        'bg-purple-500': '#a855f7',
        'bg-indigo-500': '#6366f1',
        'bg-pink-500': '#ec4899',
        'bg-teal-500': '#14b8a3',
        'bg-amber-500': '#f59e0b',
        'bg-cyan-500': '#06b6d4',
        'bg-blue-400': '#60a5fa',
        'bg-green-400': '#4ade80',
        'bg-red-500': '#ef4444',
        'bg-orange-500': '#f97316',
    };
    return map[cls] || '#9ca3af';
};
