import { useLanguage } from "../context/LanguageContext";import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Package,
  ChevronRight,
  Pill } from
'lucide-react';

export default function LowStockAlert({
  medicines,
  loading = false
}) {const { t } = useLanguage();
  if (loading) {
    return (
      <div className="space-y-4">
                {[...Array(4)].map((_, i) =>
        <div
          key={i}
          className="h-24 rounded-2xl bg-gray-200 animate-pulse">
        </div>
        )}
            </div>);

  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

                <div className="flex items-center gap-3">

                    <div className="h-11 w-11 rounded-xl bg-sky-100 flex items-center justify-center">
                        <AlertTriangle
              size={22}
              className="text-sky-600" />
            
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{t("Low Stock Medicines")}

            </h2>

                        <p className="text-sm text-gray-500">{t("Medicines that need restocking")}

            </p>
                    </div>

                </div>

                <Link
          to="/medicines"
          className="text-sky-600 font-semibold hover:text-sky-700 flex items-center gap-1">{t("View All")}


          <ChevronRight size={16} />
                </Link>

            </div>

            {/* Content */}

            <div className="p-5">

                {!medicines || medicines.length === 0 ?

        <div className="text-center py-12">

                        <Package
            size={48}
            className="mx-auto text-sky-300 mb-3" />
          

                        <h3 className="text-lg font-semibold text-gray-700">{t("Great!")}

          </h3>

                        <p className="text-gray-500">{t("No medicines are running low.")}

          </p>

                    </div> :



        <div className="space-y-4">

                        {medicines.map((medicine) => {const { t } = useLanguage();

            const percent = Math.min(
              100,
              Math.round(
                medicine.quantity /
                medicine.reorder_level *
                100
              )
            );

            let badgeColor =
            'bg-red-100 text-red-600';

            let progressColor =
            'bg-red-500';

            let badgeText = 'Critical';

            if (percent >= 80) {
              badgeColor =
              'bg-sky-100 text-sky-700';
              progressColor =
              'bg-sky-500';
              badgeText = 'Healthy';
            } else if (percent >= 50) {
              badgeColor =
              'bg-sky-200 text-sky-700';
              progressColor =
              'bg-sky-400';
              badgeText = 'Low';
            }

            return (

              <div
                key={medicine.id}
                className="
                                        border
                                        border-gray-200
                                        rounded-2xl
                                        p-4
                                        hover:shadow-md
                                        hover:border-sky-300
                                        transition-all
                                        duration-300
                                    ">









                

                                    <div className="flex justify-between items-start">

                                        <div className="flex gap-3">

                                            <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center">

                                                <Pill
                        size={22}
                        className="text-sky-600" />
                      

                                            </div>

                                            <div>

                                                <h3 className="font-bold text-gray-800">
                                                    {medicine.name}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    {medicine.category?.name ||
                        'No Category'}
                                                </p>

                                            </div>

                                        </div>

                                        <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                    
                                            {badgeText}
                                        </span>

                                    </div>

                                    {/* Progress */}

                                    <div className="mt-5">

                                        <div className="flex justify-between text-sm mb-2">

                                            <span className="text-gray-600">{t("Current Stock")}

                    </span>

                                            <span className="font-semibold">
                                                {medicine.quantity} /
                                                {medicine.reorder_level}
                                            </span>

                                        </div>

                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                                            <div
                      className={`h-full rounded-full ${progressColor}`}
                      style={{
                        width: `${percent}%`
                      }}>
                    </div>

                                        </div>

                                    </div>

                                </div>);


          })}

                    </div>

        }

            </div>

        </div>);

}