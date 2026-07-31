import React from 'react';
import {
    ClipboardList,
    Clock,
    CheckCircle,
    Truck,
    Package,
    XCircle,
} from 'lucide-react';


const statusConfig = {

    pending:{
        label:"Pending",
        icon:Clock,
        bg:"bg-yellow-50",
        text:"text-yellow-600",
        border:"border-yellow-400"
    },


    approved:{
        label:"Approved",
        icon:CheckCircle,
        bg:"bg-blue-50",
        text:"text-blue-600",
        border:"border-blue-400"
    },


    processing:{
        label:"Processing",
        icon:Truck,
        bg:"bg-purple-50",
        text:"text-purple-600",
        border:"border-purple-400"
    },


    completed:{
        label:"Completed",
        icon:Package,
        bg:"bg-green-50",
        text:"text-green-600",
        border:"border-green-400"
    },


    cancelled:{
        label:"Cancelled",
        icon:XCircle,
        bg:"bg-red-50",
        text:"text-red-600",
        border:"border-red-400"
    }

};



export default function PurchaseOrderStats({
    stats,
    loading=false
}){


    if(loading){

        return(

            <div className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                p-6
            ">

                Loading...

            </div>

        )

    }



    return(

        <div className="
            bg-white
            rounded-2xl
            shadow-md
            border
            border-gray-100
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
                border-gray-100
            ">


                <div className="
                    w-10
                    h-10
                    rounded-xl
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                ">

                    <ClipboardList
                        size={22}
                        className="text-blue-600"
                    />

                </div>



                <div>

                    <h3 className="
                        text-lg
                        font-bold
                        text-gray-800
                    ">
                        Purchase Orders
                    </h3>


                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        Order status overview
                    </p>

                </div>


            </div>



            {/* Cards */}


            <div className="
                p-6
                grid
                grid-cols-2
                md:grid-cols-5
                gap-4
            ">


                {
                    Object.entries(statusConfig)
                    .map(([key,item])=>{


                        const Icon=item.icon;

                        const count=stats?.[key] || 0;



                        return(

                            <div
                                key={key}
                                className={`
                                    ${item.bg}
                                    ${item.border}
                                    border-l-4
                                    rounded-xl
                                    p-4
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-lg
                                `}
                            >


                                <div className="
                                    flex
                                    justify-between
                                    items-start
                                ">


                                    <div>

                                        <p className="
                                            text-3xl
                                            font-extrabold
                                            text-gray-800
                                        ">
                                            {count}
                                        </p>


                                        <p className="
                                            text-sm
                                            font-medium
                                            text-gray-600
                                            mt-1
                                        ">
                                            {item.label}
                                        </p>


                                    </div>



                                    <div className="
                                        bg-white
                                        rounded-lg
                                        p-2
                                    ">

                                        <Icon
                                            size={20}
                                            className={item.text}
                                        />

                                    </div>



                                </div>



                            </div>

                        )

                    })
                }


            </div>


        </div>

    )

}