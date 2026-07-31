import React, { useEffect, useState } from 'react';

import api from '../axios';

import LoadingSpinner from '../components/LoadingSpinner';

import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

import SalesChart from '../components/SalesChart';
import PurchaseVsSalesChart from '../components/PurchaseVsSalesChart';
import InventoryStatusChart from '../components/InventoryStatusChart';

import RecentActivity from '../components/RecentActivity';
import LowStockAlert from '../components/LowStockAlert';
import ExpiryAlert from '../components/ExpiryAlert';

import PurchaseOrderStats from '../components/PurchaseOrderStats';
import QuickActions from '../components/QuickActions';



export default function AdminDashboard() {


    const [data,setData] = useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState('');



    useEffect(()=>{


        api.get('/dashboard')

        .then(response=>{

            setData(response.data);
            setError('');

        })

        .catch(error=>{

            console.error(error);
            setError('Failed to load dashboard data');

        })

        .finally(()=>{

            setLoading(false);

        });


    },[]);





    if(loading){

        return (
            <LoadingSpinner text="Loading dashboard..." />
        );

    }





    if(error){

        return(

            <div className="
                text-center
                py-12
                text-red-500
                font-medium
            ">
                {error}
            </div>

        );

    }





    const todayRevenue =
        Number(data.todayRevenue || 0);


    const todaySales =
        Number(data.todaySalesCount || 0);






    return(

        <div className="
            space-y-8
            min-h-screen
            pb-10
        ">





{/* ================= HEADER ================= */}


<div
className="
rounded-3xl
bg-gradient-to-r
from-sky-500
via-sky-600
to-sky-700
p-8
md:p-10
text-white
shadow-xl
"
>


<div className="
flex
flex-col
md:flex-row
justify-between
items-center
gap-6
">


<div>


<h1 className="
text-3xl
md:text-4xl
font-bold
">

Pharmacy Dashboard

</h1>



<p className="
mt-3
text-blue-100
">

Welcome back, Administrator

</p>



<p className="
text-sm
text-blue-200
mt-1
">

Manage medicines, inventory, sales and suppliers.

</p>


</div>





<div className="
text-center
bg-white/10
rounded-2xl
px-6
py-4
">


<div className="text-6xl">

💊

</div>


<p className="
mt-2
text-sm
text-blue-100
">

{new Date().toLocaleDateString()}

</p>


</div>




</div>


</div>









{/* ================= STAT CARDS ================= */}



<div
className="
grid
grid-cols-1
sm:grid-cols-2
md:grid-cols-3
lg:grid-cols-4
xl:grid-cols-7
gap-5
"
>


<StatCard
value={data.totalMedicines}
label="Total Medicines"
icon="package"
color="blue"
/>



<StatCard
value={data.totalStock}
label="Total Stock"
icon="boxes"
color="green"
/>



<StatCard
value={data.lowStockCount}
label="Low Stock"
icon="alert"
color="orange"
/>



<StatCard
value={data.expiredCount}
label="Expired"
icon="calendar"
color="red"
/>



<StatCard
value={data.pendingPurchaseOrders}
label="Pending Orders"
icon="shopping-cart"
color="orange"
/>



<StatCard
value={`$${todayRevenue.toFixed(2)}`}
label="Today's Sales"
icon="banknote"
color="green"
subValue={`${todaySales} transactions`}
/>



<StatCard
value={data.totalUsers}
label="Users"
icon="users"
color="purple"
/>



</div>









{/* ================= SALES ANALYTICS ================= */}



<ChartCard

title="Sales Analytics"

description="Daily, weekly and monthly sales performance"

>


<SalesChart

data={data.salesAnalytics}

/>


</ChartCard>









{/* ================= PURCHASE VS INVENTORY ================= */}



<div
className="
grid
grid-cols-1
xl:grid-cols-2
gap-6
"
>



<ChartCard

title="Purchase vs Sales"

description="Compare purchasing and selling"

>


<div className="h-72">


<PurchaseVsSalesChart

data={data.purchaseVsSales}

/>


</div>


</ChartCard>







<ChartCard

title="Inventory Status"

description="Current medicine stock condition"

>


<div className="h-72">


<InventoryStatusChart

data={data.inventoryStatus}

/>


</div>


</ChartCard>



</div>









{/* ================= PURCHASE ORDERS ================= */}



<PurchaseOrderStats

stats={data.purchaseOrderStats}

/>









{/* ================= ALERT SECTION ================= */}



<div
className="
grid
grid-cols-1
xl:grid-cols-2
gap-6
"
>


<LowStockAlert

medicines={data.lowStockMedicines}

/>



<ExpiryAlert

expiringSoon={data.expiringSoon}

/>



</div>









{/* ================= ACTIVITY ================= */}



<ChartCard

title="Recent Activity"

description="Latest pharmacy system activities"

>


<RecentActivity

activities={data.recentActivities}

/>


</ChartCard>









{/* ================= QUICK ACTION ================= */}



<QuickActions

role="admin"

/>





</div>


    );

}