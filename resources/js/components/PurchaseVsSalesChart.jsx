import { useLanguage } from "../context/LanguageContext";import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartRegistry';
import { chartColors, baseChartOptions } from './chartRegistry';

export default function PurchaseVsSalesChart({ data, loading = false }) {const { t } = useLanguage();

  const purchases = Number(data?.totalPurchases || 0);
  const sales = Number(data?.totalSales || 0);

  const chartData = {
    labels: ['Purchases', 'Sales'],
    datasets: [
    {
      label: 'Amount',
      data: [purchases, sales],

      backgroundColor: [
      'rgba(59,130,246,0.85)',
      'rgba(59,130,246,0.85)'],


      borderRadius: 12,
      barThickness: 55
    }]

  };


  const options = {
    ...baseChartOptions,

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        callbacks: {
          label: (ctx) => {
            return `$${ctx.raw.toFixed(2)}`;
          }
        }
      }
    },


    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };


  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
            </div>);

  }


  return (

    <div>

            <div className="h-72">
                <Bar
          data={chartData}
          options={options} />
        
            </div>


            <div className="
                grid grid-cols-2 gap-4
                mt-5
                pt-5
                border-t
                border-gray-200
            ">





        


                <div className="
                    bg-sky-50
                    rounded-xl
                    p-4
                    text-center
                ">




          

                    <p className="text-sky-600 font-bold text-2xl">
                        ${purchases.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-500">{t("Purchases")}

          </p>

                </div>



                <div className="
                    bg-sky-50
                    rounded-xl
                    p-4
                    text-center
                ">




          

                    <p className="text-sky-600 font-bold text-2xl">
                        ${sales.toFixed(2)}
                    </p>

                    <p className="text-sm text-gray-500">{t("Sales")}

          </p>

                </div>


            </div>

        </div>);


}