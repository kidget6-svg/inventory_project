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
        bg: 'bg-sky-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
    },
    green: {
        bg: 'bg-sky-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
    },
    orange: {
        bg: 'bg-sky-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
    },
    red: {
        bg: 'bg-sky-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
    },
    purple: {
        bg: 'bg-sky-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
    },
    teal: {
        bg: 'bg-sky-50',
        border: 'border-blue-500',
        text: 'text-blue-500',
        icon: 'text-blue-500',
        ring: 'ring-blue-200',
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
        bg-sky-50
        hover:ring-2 hover:ring-sky-200
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
