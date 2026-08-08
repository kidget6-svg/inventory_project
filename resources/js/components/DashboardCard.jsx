import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * DashboardCard — a reusable, premium card container used for the
 * information panels below the charts (Recent Activities, Low Stock,
 * Recent Sales, etc.).
 *
 * Features:
 *   • 16px rounded corners
 *   • Soft shadow with hover lift (translateY(-4px) + shadow)
 *   • Colored top border (via `borderColor` prop)
 *   • Header with small icon + View All button (optional)
 *   • Scrollable content area that auto-sizes to fit
 *   • Fixed height of 320px (configurable)
 *   • 16px internal padding
 */
export default function DashboardCard({
    title,
    icon: Icon,
    iconColor = 'text-primary-500',
    borderColor = 'border-primary-500',
    children,
    height = 'h-[320px]',
    viewAllLink = null,
    viewAllLabel = 'View All',
    className = '',
    animate = true,
}) {
    return (
        <div
            className={`
                relative overflow-hidden
                bg-white rounded-[16px]
                shadow-sm border border-gray-200
                ${borderColor.replace('border', 'border-t-4')}
                transition-all duration-300
                ${animate ? 'hover:shadow-xl hover:-translate-y-1' : ''}
                ${height}
                flex flex-col
                ${className}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50`}>
                        {Icon && <Icon size={16} className={iconColor} />}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700">
                        {title}
                    </h3>
                </div>

                {viewAllLink && (
                    <a
                        href={viewAllLink}
                        className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        {viewAllLabel}
                        <ChevronRight size={14} />
                    </a>
                )}
            </div>

            {/* Body — scrollable if content overflows */}
            <div className="px-5 py-4 overflow-y-auto overflow-x-hidden flex-1 min-h-0 scrollable-y">
                {children}
            </div>
        </div>
    );
}
