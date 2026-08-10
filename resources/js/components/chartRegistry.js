/**
 * Central Chart.js registration.
 * Import this once in any component that uses <Line>, <Bar>, <Doughnut>, etc.
 */
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export { ChartJS };


/**
 * Common chart colour palette matching the PharmaSys pharmacy theme.
 */
export const chartColors = {
    primary: '#3b82f6',   // blue
    success: '#22c55e',   // green
    warning: '#f97315',   // orange
    danger: '#ef4444',    // red
    info: '#6366f1',      // indigo
    purple: '#8b5cf6',
    teal: '#14b8a3',
    amber: '#f59e0b',
};

/**
 * Shared chart options for a clean, professional look.
 */
export const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { size: 12 },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle',
            },
        },
        tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#6b7280' },
        },
        y: {
            grid: { color: 'rgba(229, 231, 235, 0.5)' },
            ticks: { font: { size: 11 }, color: '#6b7280' },
        },
    },
    animation: {
        duration: 1200,
        easing: 'easeOutQuart',
    },
};
