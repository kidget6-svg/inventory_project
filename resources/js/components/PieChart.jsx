import React from 'react';

export default function PieChart({ title, labels = [], values = [], colors = [] }) {
    const total = values.reduce((sum, v) => sum + Number(v), 0);

    const segments = [];
    let cumulative = 0;
    const colorPalette = [
        'bg-sky-500', 'bg-sky-400', 'bg-sky-300', 'bg-sky-200',
        'bg-sky-100', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200',
        'bg-cyan-400', 'bg-cyan-300',
    ];

    labels.forEach((label, i) => {
        const pct = total > 0 ? (Number(values[i]) / total) * 100 : 0;
        cumulative += pct;
        const color = colors[i] || colorPalette[i % colorPalette.length];
        const colorHex = tailwindToHex(color);
        segments.push(`${colorHex} 0% ${pct === 0 ? 0 : cumulative - pct}%`);
    });

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
        <div className="card p-5">
            <h3 className="card-header">{title}</h3>
            <div className="flex items-center gap-6 flex-wrap">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full" style={{ background: gradient }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-700">{total}</span>
                        <span className="text-xs text-gray-500">total</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                    {labels.map((label, i) => {
                        const val = Number(values[i]);
                        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                        const color = colors[i] || colorPalette[i % colorPalette.length];
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${color}`} />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{label}</span>
                                    <span className="text-xs text-gray-400">{val} ({pct}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const tailwindToHex = (cls) => {
    const map = {
        'bg-sky-500': '#0ea5e9', 'bg-sky-400': '#38bdf8',
        'bg-sky-300': '#7dd3fc', 'bg-sky-200': '#bae6fd',
        'bg-sky-100': '#e0f2fe', 'bg-blue-400': '#60a5fa',
        'bg-blue-300': '#93c5fd', 'bg-blue-200': '#bfdbfe',
        'bg-cyan-400': '#22d3ee', 'bg-cyan-300': '#67e8f9',
        'bg-emerald-500': '#22c55e', 'bg-emerald-400': '#4ade80',
        'bg-amber-400': '#fbbf24', 'bg-red-400': '#f87171',
        'bg-purple-500': '#a855f7', 'bg-cyan-500': '#06b6d4',
        'bg-pink-500': '#ec4899', 'bg-teal-500': '#14b8a3',
        'bg-green-500': '#22c55e',
        'bg-orange-400': '#fb9225', 'bg-red-500': '#ef4444',
        'bg-orange-500': '#f97316',
    };
    return map[cls] || '#94a3b8';
};
