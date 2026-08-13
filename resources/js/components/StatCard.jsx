import React from 'react';
import {
    Package,
    Boxes,
    AlertTriangle,
    CalendarX,
    ShoppingCart,
    Banknote,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    Pill,
    ClipboardList,
} from 'lucide-react';

const iconMap = {
    package: Package,
    boxes: Boxes,
    alert: AlertTriangle,
    calendar: CalendarX,
    'shopping-cart': ShoppingCart,
    banknote: Banknote,
    users: Users,
    activity: Activity,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    pill: Pill,
    'clipboard-list': ClipboardList,
};

const colorClasses = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-950/40',  border: 'border-blue-500',  text: 'text-blue-500',    icon: 'text-blue-500 dark:text-blue-400',  ring: 'ring-blue-200' },
    green:  { bg: 'bg-green-50 dark:bg-green-950/40', border: 'border-green-500', text: 'text-green-500',   icon: 'text-green-500 dark:text-green-400', ring: 'ring-green-200' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/40',border: 'border-orange-500',text: 'text-orange-500',  icon: 'text-orange-500 dark:text-orange-400',ring: 'ring-orange-200' },
    red:    { bg: 'bg-red-50 dark:bg-red-950/40',   border: 'border-red-500',   text: 'text-red-500',     icon: 'text-red-500 dark:text-red-400',   ring: 'ring-red-200' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/40',border: 'border-purple-500',text: 'text-purple-500',  icon: 'text-purple-500 dark:text-purple-400',ring: 'ring-purple-200' },
    teal:   { bg: 'bg-teal-50 dark:bg-teal-950/40',  border: 'border-teal-500',  text: 'text-teal-500',    icon: 'text-teal-500 dark:text-teal-400',  ring: 'ring-teal-200' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40',border: 'border-indigo-500',text: 'text-indigo-500',  icon: 'text-indigo-500 dark:text-indigo-400',ring: 'ring-indigo-200' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/40',border: 'border-yellow-500',text: 'text-yellow-500',  icon: 'text-yellow-500 dark:text-yellow-400',ring: 'ring-yellow-200' },
};

export default function StatCard({
    value,
    label,
    icon = 'package',
    color = 'blue',
    trend,
    subValue,
    loading = false,
}) {
    const Icon = iconMap[icon] || Package;
    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div
            className={`
                relative overflow-hidden rounded-[16px]
                border border-gray-200 dark:border-slate-700
                bg-white dark:bg-slate-800
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-1
                transition-all duration-300
                group
                h-[136px]
            `}
        >
            {/* Colored top border */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${colors.border.replace('border', 'bg')}`}></div>

            <div className="p-5 h-full flex flex-col justify-between">

                {/* Top row: value + label on left, icon circle on right */}
                <div className="flex items-start justify-between">
                    <div>
                        {loading ? (
                            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                            <div className="text-4xl font-extrabold text-gray-800 dark:text-white">
                                {value}
                            </div>
                        )}
                        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 font-medium">
                            {label}
                        </p>
                    </div>

                    <div
                        className={`
                            h-12 w-12
                            rounded-full
                            flex items-center justify-center
                            ${colors.bg}
                            group-hover:scale-110
                            transition-transform duration-300
                        `}
                    >
                        <Icon size={22} className={colors.icon} />
                    </div>
                </div>

                {/* Bottom: trend indicator or sub-value */}
                {trend && (
                    <div className="flex items-center">
                        {trend.direction === 'up' ? (
                            <TrendingUp size={14} className="text-success-500" />
                        ) : (
                            <TrendingDown size={14} className="text-danger-500" />
                        )}
                        <span
                            className={`ml-1 text-xs font-semibold ${
                                trend.direction === 'up'
                                    ? 'text-success-600'
                                    : 'text-danger-600'
                            }`}
                        >
                            {trend.value}
                        </span>
                    </div>
                )}

                {subValue && (
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                        {subValue}
                    </p>
                )}

            </div>

            {/* Subtle glow accent */}
            <div
                className="
                    absolute
                    top-0 right-0
                    w-24 h-24
                    rounded-full
                    bg-white dark:bg-slate-900
                    opacity-50 dark:opacity-10
                    blur-2xl
                    translate-x-8
                    -translate-y-8
                "
            ></div>
        </div>
    );
}
