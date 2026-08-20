import { useLanguage } from "../context/LanguageContext";import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Pill,
  Warehouse,
  Clock,
  Truck,
  FolderTree,
  ArrowRight,
  ShoppingBag } from
'lucide-react';


const adminActions = [
{
  to: '/medicines',
  label: 'Medicines',
  description: 'Manage medicines catalog',
  icon: Pill,
  color: 'blue'
},
{
  to: '/retail-products',
  label: 'Retail & OTC Products',
  description: 'Manage retail & OTC catalog',
  icon: Package,
  color: 'blue'
},
{
  to: '/purchase-orders',
  label: 'Purchase Order',
  description: 'Order new stock',
  icon: ShoppingCart,
  color: 'blue'
},
{
  to: '/users',
  label: 'Manage Users',
  description: 'All users & permissions',
  icon: Users,
  color: 'blue'
},
{
  to: '/users?status=pending',
  label: 'Review Pending',
  description: 'Approve applications',
  icon: Clock,
  color: 'orange'
},
{
  to: '/suppliers',
  label: 'Suppliers',
  description: 'Manage suppliers',
  icon: Truck,
  color: 'blue'
},
{
  to: '/categories',
  label: 'Categories',
  description: 'Manage categories',
  icon: FolderTree,
  color: 'blue'
},
{
  to: '/reports',
  label: 'Reports',
  description: 'View analytics',
  icon: BarChart3,
  color: 'blue'
}];



const pharmacistActions = [
{
  to: '/sales',
  label: 'New Sale',
  description: 'Add items & send to checkout',
  icon: Plus,
  color: 'blue'
},
{
  to: '/sales-checkout',
  label: 'Sales Checkout',
  description: 'Process payments',
  icon: ShoppingCart,
  color: 'blue'
},
{
  to: '/medicines',
  label: 'Add Medicine',
  description: 'Update inventory',
  icon: Plus,
  color: 'blue'
},
{
  to: '/stock-movements',
  label: 'Stock Movement',
  description: 'Track stock',
  icon: Warehouse,
  color: 'blue'
},
{
  to: '/reports',
  label: 'Reports',
  description: 'Inventory reports',
  icon: BarChart3,
  color: 'blue'
}];



const cashierActions = [
{
  to: '/sales-checkout',
  label: 'Sales Checkout',
  description: 'Process pending payments',
  icon: Plus,
  color: 'blue'
},
{
  to: '/sales',
  label: 'New Sale',
  description: 'Create an order',
  icon: ShoppingCart,
  color: 'blue'
},
{
  to: '/medicines',
  label: 'Medicines',
  description: 'Search products',
  icon: Pill,
  color: 'blue'
},
{
  to: '/reports',
  label: 'Reports',
  description: 'Sales reports',
  icon: BarChart3,
  color: 'blue'
}];



const actionsByRole = {
  admin: adminActions,
  pharmacist: pharmacistActions,
  cashier: cashierActions
};


const colors = {

  blue: {
    bg: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-600',
    hover: 'hover:border-sky-300'
  },

  orange: {
    bg: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-600',
    hover: 'hover:border-sky-300'
  },

  green: {
    bg: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-600',
    hover: 'hover:border-sky-300'
  },

  purple: {
    bg: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-600',
    hover: 'hover:border-sky-300'
  },

  teal: {
    bg: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-600',
    hover: 'hover:border-sky-300'
  },

  cyan: {
    bg: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-600',
    hover: 'hover:border-sky-300'
  }

};


export default function QuickActions({
  role = 'admin'
}) {const { t } = useLanguage();


  const actions =
  actionsByRole[role] || cashierActions;


  return (

    <div className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            border-gray-200
            p-6
        ">






      


            {/* Header */}

            <div className="
                flex
                justify-between
                items-center
                mb-5
            ">




        

                <div>

                    <h2 className="
                        text-lg
                        font-bold
                        text-gray-800
                    ">{t("Quick Actions")}





          </h2>

                    <p className="
                        text-sm
                        text-gray-500
                    ">{t("Frequently used operations")}




          </p>

                </div>


            </div>

            {/* Actions */}

            <div className="
                grid
                grid-cols-2
                sm:grid-cols-3
                lg:grid-cols-5
                gap-4
            ">





        

                {actions.map((action) => {const { t } = useLanguage();

          const Icon = action.icon;

          const style =
          colors[action.color];

          return (

            <Link

              key={action.to}

              to={action.to}

              className={`
                                ${style.bg}
                                ${style.hover}

                                border
                                border-transparent

                                rounded-2xl
                                p-5

                                transition-all
                                duration-300

                                hover:-translate-y-1
                                hover:shadow-lg

                                group
                            `}>

              

                            <div className="
                                flex
                                justify-between
                                items-start
                            ">



                

                                <div className={`
                                    h-12
                                    w-12
                                    rounded-xl
                                    flex
                                    items-center
                                    justify-center
                                    ${style.icon}
                                    group-hover:scale-110
                                    transition
                                `}>

                                    <Icon size={24} />

                                </div>

                                <ArrowRight
                  size={18}
                  className="
                                        text-gray-400
                                        group-hover:translate-x-1
                                        transition
                                    " />




                

                            </div>

                            <h3 className="
                                mt-5
                                font-bold
                                text-gray-800
                            ">



                

                                {action.label}

                            </h3>

                            <p className="
                                mt-1
                                text-xs
                                text-gray-500
                            ">



                

                                {action.description}

                            </p>

                        </Link>);



        })}

            </div>


        </div>);



}