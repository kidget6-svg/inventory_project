import React, { useState } from 'react';
import {
    CalendarX,
    Package,
    Pill,
    Clock,
} from 'lucide-react';

export default function ExpiryAlert({
    expiringSoon,
    loading = false,
}) {

    const [activeTab, setActiveTab] = useState('30_days');

    const tabs = [
        {
            key: '30_days',
            label: '30 Days',
            color: 'text-red-600',
        },
        {
            key: '60_days',
            label: '60 Days',
            color: 'text-orange-600',
        },
        {
            key: '90_days',
            label: '90 Days',
            color: 'text-yellow-600',
        },
    ];


    const activeData = expiringSoon?.[activeTab] || [];


    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="animate-pulse space-y-4">

                    <div className="h-8 bg-gray-200 rounded"></div>

                    {[1,2,3].map(i=>(
                        <div
                            key={i}
                            className="h-20 bg-gray-200 rounded-xl"
                        ></div>
                    ))}

                </div>
            </div>
        );
    }



    return (

        <div className="
            bg-white
            rounded-2xl
            shadow-lg
            border border-gray-200
            overflow-hidden
        ">


            {/* Header */}

            <div className="
                flex
                items-center
                gap-3
                px-6
                py-5
                border-b
            ">

                <div className="
                    h-12
                    w-12
                    rounded-xl
                    bg-red-100
                    flex
                    items-center
                    justify-center
                ">
                    <CalendarX
                        size={24}
                        className="text-red-600"
                    />
                </div>


                <div>

                    <h2 className="
                        text-lg
                        font-bold
                        text-gray-800
                    ">
                        Expiry Management
                    </h2>


                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        Medicines approaching expiry date
                    </p>

                </div>


            </div>



            {/* Tabs */}

            <div className="p-5">

                <div className="
                    flex
                    bg-gray-100
                    rounded-xl
                    p-1
                    mb-5
                ">


                    {tabs.map(tab=>(

                        <button

                            key={tab.key}

                            onClick={()=>setActiveTab(tab.key)}

                            className={`
                                flex-1
                                py-2
                                text-sm
                                font-semibold
                                rounded-lg
                                transition-all

                                ${
                                activeTab === tab.key
                                ?
                                `bg-white shadow text-red-600`
                                :
                                `text-gray-500 hover:text-gray-700`
                                }

                            `}
                        >

                            {tab.label}

                        </button>


                    ))}


                </div>





                {/* Medicines */}


                {!activeData.length ? (

                    <div className="
                        text-center
                        py-12
                    ">

                        <Package
                            size={45}
                            className="
                                mx-auto
                                text-green-400
                                mb-3
                            "
                        />

                        <h3 className="
                            font-semibold
                            text-gray-700
                        ">
                            No Expiring Medicines
                        </h3>


                        <p className="
                            text-sm
                            text-gray-500
                        ">
                            Inventory is safe for this period
                        </p>


                    </div>


                ) : (


                    <div className="space-y-4">


                    {activeData.map(medicine=>(


                        <div

                            key={medicine.id}

                            className="
                                p-4
                                rounded-2xl
                                border
                                border-gray-200
                                hover:border-red-300
                                hover:shadow-md
                                transition-all
                            "
                        >



                            <div className="
                                flex
                                justify-between
                                items-start
                            ">



                                <div className="
                                    flex
                                    gap-3
                                ">


                                    <div className="
                                        h-12
                                        w-12
                                        rounded-xl
                                        bg-red-100
                                        flex
                                        items-center
                                        justify-center
                                    ">

                                        <Pill
                                            size={22}
                                            className="text-red-600"
                                        />

                                    </div>



                                    <div>

                                        <h3 className="
                                            font-bold
                                            text-gray-800
                                        ">
                                            {medicine.name}
                                        </h3>


                                        <p className="
                                            text-sm
                                            text-gray-500
                                        ">
                                            Batch:
                                            {' '}
                                            {medicine.batch_number || '---'}
                                        </p>


                                    </div>


                                </div>





                                <div className="
                                    text-right
                                ">


                                    <span className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        bg-red-100
                                        text-red-600
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-bold
                                    ">

                                        <Clock size={13}/>

                                        {medicine.expiry_date}

                                    </span>


                                </div>


                            </div>



                        </div>



                    ))}


                    </div>


                )}



            </div>



        </div>

    );

}