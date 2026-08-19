import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { ChartJS } from './chartRegistry';

/**
 * Fallback colour palette — 12 carefully chosen, professional colours
 * (no plain blue/green repetition) used when a category name is not in the
 * explicit mapping below.
 */
const healthPalette = [
    '#3b82f6', '#22c55e', '#06b6de', '#f59e0b',
    '#8b5cf6', '#14b8a3', '#ef4444', '#f97316',
    '#0ea5e9', '#ec4899', '#2563eb', '#16a34a',
];

/**
 * Explicit colour mapping for the 8 pharmacy categories.
 * Each category receives a semantically meaningful, consistent colour so the
 * slices are always identifiable even without a legend.
 * Falls back to the palette cycling for any category not listed here.
 */
const categoryColors = {
    'Antibiotics':          '#3b82f6', // blue     — trusted medical
    'Pain Relief':          '#ef4444', // red      — pain / alert
    'Vitamins':             '#22c55e', // green    — health / nutrition
    'First Aid':            '#f59e0b', // amber    — caution / emergency
    'Chronic Care':         '#8b5cf6', // purple   — long-term care
    'Controlled Substances': '#f97316', // orange  — controlled / warning
    'Medical Supplies':     '#14b8a3', // teal     — equipment / supplies
    'Personal Care':        '#06b6de', // cyan     — gentle / personal
};

/**
 * Centre-text plugin: draws the total medicine count and a descriptive
 * label in the middle of the doughnut so users can see the overall figure
 * at a glance.  Category details appear only on hover via the tooltip.
 */
const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart) => {
        const { ctx, data, chartArea } = chart;
        if (!chartArea) return;

        const total = data.datasets[0].data.reduce(
            (sum, v) => sum + Number(v), 0
        );

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Total count — large, bold
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillStyle = '#1f2937'; // gray-800
        ctx.fillText(total, centerX, centerY - 10);

        // Descriptive label — small, italic
        ctx.font = 'italic 13px Arial, sans-serif';
        ctx.fillStyle = '#6b7280'; // gray-500
        ctx.fillText('Total Medicines', centerX, centerY + 22);

        ctx.restore();
    },
};

// Register the centre-text plugin with Chart.js
ChartJS.register(centerTextPlugin);

/**
 * PieChart / Doughnut component for "Inventory by Category".
 *
 * A clean, modern analytics dashboard card:
 *  - A single doughnut chart with a large cutout (72 %) so the centre is
 *    dominated by the total medicine count.
 *  - Centre text shows the total and a "Total Medicines" label.
 *  - Category details are revealed only on hover via tooltips.
 *  - No legend, no percentage labels on slices, no text lists.
 */
export default function PieChart({ labels = [], values = [] }) {
    // Assign a colour to every category — prefer the explicit semantic
    // mapping; fall back to the palette cycling for unknown categories.
    const bgColors = labels.map((label, i) =>
        categoryColors[label] ?? healthPalette[i % healthPalette.length]
    );

    // Slightly darker border per slice for crisp separation between arcs.
    const borderColors = bgColors.map(c => shadeColor(c, -15));

    const total = values.reduce((sum, v) => sum + Number(v), 0);

    const chartData = {
        labels,
        datasets: [
            {
                data: values.map(v => Number(v)),
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1,
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
                callbacks: {
                    label: (ctx) => {
                        const value = Number(ctx.raw);
                        const pct = total > 0
                            ? Math.round((value / total) * 100)
                            : 0;
                        return `${ctx.label}: ${value} (${pct}%)`;
                    },
                },
            },
        },
        animation: {
            duration: 1200,
            easing: 'easeOutQuart',
        },
    };

    return (
        <div className="card p-6 flex flex-col items-center h-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Inventory by Category
            </h3>
            <div className="relative w-full flex-1 min-h-[200px] flex items-center justify-center">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
}

/**
 * Shades a hex colour by the given percentage.
 * Positive values lighten, negative values darken.
 * Used to generate a border colour that contrasts slightly with each
 * slice's fill colour for better visual separation.
 */
function shadeColor(hex, percent) {
    let R = parseInt(hex.slice(1, 3), 16);
    let G = parseInt(hex.slice(3, 5), 16);
    let B = parseInt(hex.slice(5, 7), 16);

    const factor = percent / 100;

    R = Math.min(255, Math.max(0, Math.floor(R * (1 + factor))));
    G = Math.min(255, Math.max(0, Math.floor(G * (1 + factor))));
    B = Math.min(255, Math.max(0, Math.floor(B * (1 + factor))));

    const toHex = (c) => c.toString(16).padStart(2, '0');

    return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}
