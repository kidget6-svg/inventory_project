import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import "./chartRegistry";
import { chartColors, baseChartOptions } from "./chartRegistry";
import { formatCurrency, formatCompact } from "../utils/money";

export default function SalesChart({
    data: analytics,
    loading = false,
}) {

    const [activeTab, setActiveTab] = useState("daily");

    const tabs = [
        { key: "daily", label: "Daily" },
        { key: "weekly", label: "Weekly" },
        { key: "monthly", label: "Monthly" },
    ];

    const activeData = analytics?.[activeTab] || [];

    const chartData = {
        labels: activeData.map(item => item.label),
        datasets: [
            {
                label: "Sales",

                data: activeData.map(item => item.total),

                fill: true,

                borderColor: "#3B82F6",

                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;

                    if (!chartArea) return null;

                    const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );

                    gradient.addColorStop(0,"rgba(59,130,246,.35)");
                    gradient.addColorStop(.5,"rgba(59,130,246,.10)");
                    gradient.addColorStop(1,"rgba(59,130,246,0)");

                    return gradient;
                },

                borderWidth: 4,

                pointRadius: 5,

                pointHoverRadius: 8,

                pointBorderWidth: 3,

                pointBackgroundColor: "#3B82F6",

                pointBorderColor: "#fff",

                tension: .45,

                cubicInterpolationMode: "monotone",
            },
        ],
    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index",
        },

        plugins: {

            legend: {
                display: false,
            },

            tooltip: {

                backgroundColor: "#111827",

                padding: 12,

                cornerRadius: 10,

                displayColors: false,

                callbacks: {

                    title(items){
                        return items[0].label;
                    },

                    label(context){
                        return "Sales : " + formatCurrency(context.parsed.y);
                    }
                }
            }
        },

        scales: {

            x: {

                grid:{
                    display:false
                },

                ticks:{
                    color:"#64748B",
                    font:{
                        size:12,
                        weight:"600"
                    },
                    maxRotation: 0,
                    minRotation: 0,
                    autoSkip: true,
                    autoSkipPadding: 12,
                }
            },

            y:{

                beginAtZero:true,

                grid:{
                    color:"rgba(148,163,184,.18)"
                },

                border:{
                    dash:[5,5]
                },

                ticks:{
                    color:"#64748B",

                    callback:(value)=>formatCompact(value)
                }
            }
        }
    };

    if(loading){
        return(
            <div className="h-72 flex items-center justify-center">

                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"/>

            </div>
        )
    }

    return(

        <div>

            {/* Tabs */}

            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">

                {tabs.map(tab=>(

                    <button

                        key={tab.key}

                        onClick={()=>setActiveTab(tab.key)}

                        className={`
                            flex-1 py-2 rounded-lg
                            font-semibold
                            transition-all duration-300
                            ${
                                activeTab===tab.key
                                ?"bg-white text-blue-600 shadow"
                                :"text-gray-500 hover:text-gray-700"
                            }
                        `}
                    >

                        {tab.label}

                    </button>

                ))}

            </div>

            <div className="h-80">

                {activeData.length ? (

                    <Line
                        data={chartData}
                        options={options}
                    />

                ) : (

                    <div className="h-full flex items-center justify-center text-gray-400">

                        No sales available

                    </div>

                )}

            </div>

        </div>

    );

}