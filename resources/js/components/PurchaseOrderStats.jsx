import { useLanguage } from "../context/LanguageContext";import React from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle } from
'lucide-react';


const statusConfig = {

  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-400"
  },


  approved: {
    label: "Approved",
    icon: CheckCircle,
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-400"
  },


  processing: {
    label: "Processing",
    icon: Truck,
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-400"
  },


  completed: {
    label: "Completed",
    icon: Package,
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-400"
  },


  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-400"
  }

};



export default function PurchaseOrderStats({
  stats,
  loading = false
}) {const { t } = useLanguage();


  if (loading) {

    return (

      <div className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-gray-200
                p-6
            ">






        

                Loading...

            </div>);



  }



  return (

    <div className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            border-gray-200
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
                border-gray-200
            ">







        


                <div className="
                    w-10
                    h-10
                    rounded-xl
                    bg-sky-100
                    flex
                    items-center
                    justify-center
                ">







          

                    <ClipboardList
            size={22}
            className="text-sky-600" />
          

                </div>



                <div>

                    <h3 className="
                        text-lg
                        font-bold
                        text-gray-800
                    ">{t("Purchase Orders")}





          </h3>


                    <p className="
                        text-sm
                        text-gray-500
                    ">{t("Order status overview")}




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
        Object.entries(statusConfig).
        map(([key, item]) => {const { t } = useLanguage();


          const Icon = item.icon;

          const count = stats?.[key] || 0;



          return (

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
                                    hover:shadow-md
                                `}>
              


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
                    className={item.text} />
                  

                                    </div>



                                </div>



                            </div>);



        })
        }


            </div>


        </div>);



}