import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './chartRegistry';


export default function InventoryStatusChart({data, loading=false}){


const inStock = Number(data?.inStock || 0);
const lowStock = Number(data?.lowStock || 0);
const outOfStock = Number(data?.outOfStock || 0);
const expired = Number(data?.expired || 0);


const total =
inStock +
lowStock +
outOfStock +
expired;



const chartData={

labels:[
'In Stock',
'Low Stock',
'Out Of Stock',
'Expired'
],

datasets:[
{
data:[
inStock,
lowStock,
outOfStock,
expired
],

backgroundColor:[
'#38bdf8',
'#7dd3fc',
'#93c5fd',
'#bfdbfe'
],

borderWidth:4,
borderColor:'#ffffff',

hoverOffset:10

}

]

};



const options={

cutout:'70%',


plugins:{


legend:{
position:'bottom',

labels:{
padding:20,
usePointStyle:true
}

}


}

};



if(loading){

return(
<div className="h-72 flex justify-center items-center">
<div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"/>
</div>
)

}



return(

<div>


<div className="relative h-72">


<Doughnut
data={chartData}
options={options}
/>


<div className="
absolute
inset-0
flex
items-center
justify-center
flex-col
pointer-events-none
">

<h2 className="text-4xl font-bold text-gray-800">
{total}
</h2>

<p className="text-gray-500 text-sm">
Medicines
</p>


</div>


</div>



</div>


)


}
