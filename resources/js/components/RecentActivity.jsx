import { useLanguage } from "../context/LanguageContext";import React from 'react';
import {
  ShoppingCart,
  Package,
  Pill,
  Activity,
  Clock,
  User } from
'lucide-react';

const iconMap = {
  'shopping-cart': ShoppingCart,
  package: Package,
  pill: Pill,
  activity: Activity
};

const iconColors = {
  'shopping-cart': 'bg-sky-100 text-sky-600',
  package: 'bg-sky-100 text-sky-600',
  pill: 'bg-sky-100 text-sky-600',
  activity: 'bg-sky-100 text-sky-600'
};

export default function RecentActivity({
  activities,
  loading = false
}) {const { t } = useLanguage();
  if (loading) {
    return (
      <div className="space-y-4">

                {[...Array(6)].map((_, i) =>

        <div
          key={i}
          className="
                            flex items-center
                            gap-4
                            p-4
                            rounded-2xl
                            border
                            border-gray-100
                            bg-white
                            animate-pulse
                        ">









          

                        <div className="h-12 w-12 rounded-2xl bg-gray-200"></div>

                        <div className="flex-1">

                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>

                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>

                        </div>

                    </div>

        )}

            </div>);

  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center">

                <Clock
          size={42}
          className="mx-auto text-gray-300 mb-3" />
        

                <h3 className="text-lg font-semibold text-gray-500">{t("No Recent Activity")}

        </h3>

                <p className="text-sm text-gray-400 mt-1">{t("New activity will appear here.")}

        </p>

            </div>);

  }

  return (
    <div className="space-y-3">

            {activities.map((activity) => {const { t } = useLanguage();

        const Icon =
        iconMap[activity.icon] || Activity;

        const color =
        iconColors[activity.icon] ||
        'bg-sky-100 text-sky-600';

        return (

          <div
            key={activity.id}
            className="
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            p-4
                            shadow-sm
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-md
                            hover:border-sky-200
                            group
                        ">
















            

                        {/* LEFT SIDE */}

                        <div className="flex items-center gap-4">

                            <div
                className={`
                                    h-12
                                    w-12
                                    rounded-2xl
                                    flex
                                    items-center
                                    justify-center
                                    transition-all
                                    duration-300
                                    group-hover:scale-110
                                    ${color}
                                `}>
                

                                <Icon size={22} />

                            </div>

                            <div>

                                <h3 className="font-semibold text-gray-800">

                                    {activity.action}

                                </h3>

                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">

                                    <span className="flex items-center gap-1">

                                        <User size={13} />

                                        {activity.user}

                                    </span>

                                    <span>•</span>

                                    <span>{activity.date}</span>

                                </div>

                            </div>

                        </div>

                        {/* RIGHT SIDE */}

                        <div className="text-right">

                            <span
                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    px-3
                                    py-1
                                    rounded-full
                                    bg-sky-50
                                    text-sky-600
                                    text-xs
                                    font-semibold
                                ">











                

                                <Clock size={12} />

                                {activity.time}

                            </span>

                        </div>

                    </div>);



      })}

        </div>);

}