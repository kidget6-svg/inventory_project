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
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
    },
    'sky-blue': {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-500',
        icon: 'text-green-500',
        ring: 'ring-green-200',
    },
    'sky-blue': {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-500',
        icon: 'text-orange-500',
        ring: 'ring-orange-200',
    },
   'sky-blue': {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-500',
        icon: 'text-red-500',
        ring: 'ring-red-200',
    },
'sky-blue': {
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        text: 'text-purple-500',
        icon: 'text-purple-500',
        ring: 'ring-purple-200',
    },
    teal: {
        bg: 'bg-teal-50',
        border: 'border-teal-500',
        text: 'text-teal-500',
        icon: 'text-teal-500',
        ring: 'ring-teal-200',
    },
    indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-500',
        text: 'text-indigo-500',
        icon: 'text-indigo-500',
        ring: 'ring-indigo-200',
    },
    yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-500',
        icon: 'text-yellow-500',
        ring: 'ring-yellow-200',
    },
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
        relative overflow-hidden rounded-2xl
        border border-gray-200
        bg-white
        shadow-sm
        hover:shadow-md
        transition-all duration-300
        group
    `}
>
        {/* Colored top bar */}
       <div className={`absolute top-0 left-0 right-0 h-1 ${colors.border.replace('border','bg')}`}></div>

        <div className="p-8">

            <div className="flex justify-between items-start">

                <div>

                    {loading ? (
                        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <h2 className={`text-5xl font-extrabold ${colors.text}`}>
                            {value}
                        </h2>
                    )}

                    <p className="mt-2 text-gray-700 font-medium">
                        {label}
                    </p>

                    {subValue && (
                        <p className="text-sm text-gray-500 mt-1">
                            {subValue}
                        </p>
                    )}

                </div>

               <div

    className={`
        h-16 w-16
        rounded-2xl
        flex items-center justify-center
        ${colors.bg}
        hover:ring-2 hover:${colors.ring}
        group-hover:rotate-12
        group-hover:scale-110
        transition-all duration-300
    `}
>
                    <Icon
                        size={34}
                        className={colors.icon}
                    />
                </div>

            </div>

            {trend && (
                <div className="mt-5 flex items-center">

                    {trend.direction === 'up' ? (
                        <TrendingUp
                            size={16}
                            className="text-sky-500"
                        />
                    ) : (
                        <TrendingDown
                            size={16}
                            className="text-sky-500"
                        />
                    )}

                    <span
                        className={`ml-2 text-sm font-semibold text-sky-600`}
                    >
                        {trend.value}
                    </span>

                </div>
            )}

        </div>

        <div
            className="
                absolute
                top-0
                right-0
                w-32
                h-32
                rounded-full
                bg-white
               opacity-5 blur-xl
                translate-x-10
                -translate-y-10
            "
        ></div>

    </div>
);

}
