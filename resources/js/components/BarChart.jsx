import { useLanguage } from "../context/LanguageContext";import React from 'react';
import { Bar } from 'react-chartjs-2';
import { baseChartOptions } from './chartRegistry';
/**
 * Modern BarChart — uses Chart.js (via react-chartjs-2) for a clean,
 * professional look with rounded bars, smooth animations, and minimal
 * grid lines.
 *
 * Props are identical to the original CSS-only BarChart so the
 * AdminDashboard can swap it in without any call-site changes:
 *   title, labels[], values[], color, valuePrefix, valueSuffix, currency
 */
export default function BarChart({
  title,
  labels = [],
  values = [],
  color = 'blue',
  valuePrefix = '',
  valueSuffix = '',
  currency = false
}) {const { t } = useLanguage();
  /* Map the semantic `color` prop to a Chart.js hex colour. */
  const colorMap = {
    sky: '#3b82f6',
    blue: '#2563eb',
    indigo: '#6366f1',
    green: '#22c55e',
    orange: '#f97316',
    red: '#ef4444',
    purple: '#8b5cf6',
    teal: '#14b8a3',
    yellow: '#f59e0b'
  };
  const barColor = colorMap[color] || colorMap.blue;

  /* Format a single bar value for the tooltip / y-axis. */
  const formatValue = (val) => {
    if (currency) return `$${Number(val).toFixed(2)}`;
    return `${valuePrefix}${Number(val)}${valueSuffix}`;
  };

  const chartData = {
    labels,
    datasets: [
    {
      label: title,
      data: values.map((v) => Number(v)),
      backgroundColor: barColor,
      borderColor: barColor,
      borderRadius: 6,
      borderWidth: 0,
      barThickness: 24,
      maxBarThickness: 34
    }]

  };

  const options = {
    ...baseChartOptions,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        borderColor: 'rgba(' + hexToRgb(barColor) + ', 0.3)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => formatValue(ctx.raw)
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#9ca3af' },
        border: { display: false }
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#9ca3af',
          callback: (val) => {
            if (currency) return `$${val}`;
            return val;
          }
        },
        border: { display: false }
      }
    }
  };

  return (
    <div className="card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    {title}
                </h3>
            </div>
            <div className="flex-1 h-[230px]">
                {labels.length > 0 ?
        <Bar data={chartData} options={options} /> :

        <div className="h-full flex items-center justify-center text-gray-400 text-sm">{t("No data available")}

        </div>
        }
            </div>
        </div>);

}

/* Small helper: convert "#2563eb" → "37,99,235" for rgba() usage. */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 2 + h.length - 4), 16) || parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(h.length > 4 ? 4 : 2), 16);
  return `${r}, ${g}, ${b}`;
}