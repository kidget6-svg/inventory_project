import React, { useState, useEffect } from 'react';
import api from '../axios';
import { Edit, Trash2 } from 'lucide-react';

export default function PurchaseOrders() {

    console.log("PurchaseOrders loaded");

    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);

    // the rest of your code...
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        supplier_id: '',
        order_date: '',
        medicine_id: '',
        quantity: '',
        unit_price: ''
    });

    const [error, setError] = useState('');


   const load = async () => {
    try {
        const res = await api.get('/purchase-orders');
        console.log("Purchase Orders:", res.data); // <-- Add this line
        setOrders(res.data);
    } catch (err) {
        console.error(err);
    }
};


    useEffect(() => {

        load();

        api.get('/suppliers')
            .then(res => setSuppliers(res.data));

        api.get('/medicines')
            .then(res => setMedicines(res.data));

    }, []);



    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };



    const openCreate = () => {

        setForm({
            supplier_id:'',
            order_date:'',
            medicine_id:'',
            quantity:'',
            unit_price:''
        });

        setEditId(null);
        setShowForm(true);
        setError('');

    };



    const openEdit = async (order) => {

        try {

            const res = await api.get(`/purchase-orders/${order.id}`);

            const data = res.data;
            const item = data.items?.[0];


            setForm({

                supplier_id: data.supplier_id || '',
                order_date: data.order_date || '',
                medicine_id: item?.medicine_id || '',
                quantity: item?.quantity || '',
                unit_price: item?.unit_price || ''

            });


            setEditId(order.id);
            setShowForm(true);

        } catch(err){

            console.error(err);

        }

    };




    const handleSubmit = async(e)=>{

        e.preventDefault();

        try{

            if(editId){

                await api.put(
                    `/purchase-orders/${editId}`,
                    form
                );

            }else{

                await api.post(
                    '/purchase-orders',
                    form
                );

            }


            setShowForm(false);
            setEditId(null);

            load();


        }catch(err){

            const msgs = err.response?.data?.errors;

            setError(
                msgs
                ? Object.values(msgs).flat().join(' ')
                : 'Error saving order'
            );

        }

    };




    const handleDelete = async(id)=>{

        if(!confirm('Delete this purchase order?'))
            return;


        try{

            await api.delete(`/purchase-orders/${id}`);

            load();

        }catch(err){

            setError(
                err.response?.data?.message ||
                'Failed to delete order'
            );

        }

    };




    const handleAction = async(id,action)=>{

        try{

            await api.post(
                `/purchase-orders/${id}/${action}`
            );

            load();

        }catch(err){

            setError(
                err.response?.data?.message ||
                `Failed to ${action}`
            );

        }

    };



    const statusBadge=(status)=>{

        const colors={

            pending:
            'bg-sky-100 text-sky-700',

            approved:
            'bg-purple-100 text-purple-700',

            processing:
            'bg-yellow-100 text-yellow-700',

            completed:
            'bg-green-100 text-green-700',

            cancelled:
            'bg-red-100 text-red-700'

        };


        return `
        px-3 py-1 rounded-full text-xs font-semibold
        ${colors[status] || 'bg-gray-100 text-gray-600'}
        `;

    };



    return (

<div className="space-y-6">


<div className="flex justify-between items-center">

<h3 className="text-base font-semibold text-gray-700">
All Purchase Orders ({orders.length})
</h3>


<button
onClick={openCreate}
className="btn-primary px-4 py-2 text-sm"
>
+ New Order
</button>


</div>
{showForm && (

<div className="card p-5">

<h4 className="font-semibold text-gray-700 mb-3">
{editId ? 'Edit Purchase Order' : 'Create Purchase Order'}
</h4>


{error && (
<div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
{error}
</div>
)}



<form 
onSubmit={handleSubmit}
className="grid grid-cols-1 md:grid-cols-2 gap-4"
>


<div>
<label className="block text-xs font-semibold text-gray-600 mb-1">
Supplier *
</label>

<select
name="supplier_id"
value={form.supplier_id}
onChange={handleChange}
className="w-full px-3 py-2 border rounded-lg text-sm"
required
>

<option value="">Select Supplier</option>

{suppliers.map(s=>(

<option key={s.id} value={s.id}>
{s.name}
</option>

))}

</select>

</div>




<div>

<label className="block text-xs font-semibold text-gray-600 mb-1">
Order Date *
</label>


<input
type="date"
name="order_date"
value={form.order_date}
onChange={handleChange}
className="w-full px-3 py-2 border rounded-lg text-sm"
required
/>

</div>





<div>

<label className="block text-xs font-semibold text-gray-600 mb-1">
Medicine *
</label>


<select
name="medicine_id"
value={form.medicine_id}
onChange={handleChange}
className="w-full px-3 py-2 border rounded-lg text-sm"
required
>


<option value="">
Select Medicine
</option>


{medicines.map(m=>(

<option key={m.id} value={m.id}>
{m.name}
</option>

))}


</select>

</div>





<div>

<label className="block text-xs font-semibold text-gray-600 mb-1">
Quantity *
</label>


<input
type="number"
name="quantity"
value={form.quantity}
onChange={handleChange}
className="w-full px-3 py-2 border rounded-lg text-sm"
required
/>

</div>





<div>

<label className="block text-xs font-semibold text-gray-600 mb-1">
Unit Price *
</label>


<input
type="number"
step="0.01"
name="unit_price"
value={form.unit_price}
onChange={handleChange}
className="w-full px-3 py-2 border rounded-lg text-sm"
required
/>

</div>





<div className="md:col-span-2 flex justify-end gap-3">


<button
type="button"
onClick={()=>setShowForm(false)}
className="px-5 py-2 border rounded-lg text-gray-600"
>
Cancel
</button>



<button
type="submit"
className="px-5 py-2 bg-sky-500 text-white rounded-lg"
>
{editId ? 'Update Order' : 'Create Order'}
</button>



</div>


</form>


</div>

)}






<div className="card overflow-hidden">


<table className="w-full">


<thead>

<tr className="bg-sky-50">


<th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">
ID
</th>


<th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">
Supplier
</th>


<th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">
Date
</th>


<th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">
Status
</th>


<th className="px-4 py-3 text-left text-xs font-semibold text-sky-700">
Amount
</th>


<th className="px-4 py-3 text-right text-xs font-semibold text-sky-700">
Actions
</th>


</tr>

</thead>




<tbody>

{orders.map((o) => {

    const status = o.status?.toLowerCase();

    return (

        <tr
            key={o.id}
            className="border-b hover:bg-sky-50/30"
        >

            <td className="px-4 py-3 text-sm">
                #{o.id}
            </td>


            <td className="px-4 py-3 text-sm">
                {o.supplier?.name || "---"}
            </td>


            <td className="px-4 py-3 text-sm">
                {o.order_date}
            </td>


            <td className="px-4 py-3">

                <span className={statusBadge(status)}>
                    {status}
                </span>

            </td>


            <td className="px-4 py-3 text-sm">
                ${Number(o.total_amount || 0).toFixed(2)}
            </td>


            <td className="px-4 py-3">

                <div className="flex justify-end gap-2 flex-wrap">


                    {/* Pending → Approve */}

                    {status === "pending" && (

                        <button
                            onClick={() =>
                                handleAction(o.id,"approve")
                            }
                            className="px-2 py-1 bg-sky-500 text-white rounded text-xs"
                        >
                            Approve
                        </button>

                    )}



                    {/* Approved → Process */}

                    {status === "approved" && (

                        <button
                            onClick={() =>
                                handleAction(o.id,"process")
                            }
                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                        >
                            Process
                        </button>

                    )}




                    {/* Approved/Processing → Complete */}

                    {["approved","processing"].includes(status) && (

                        <button
                            onClick={() =>
                                handleAction(o.id,"complete")
                            }
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                        >
                            Complete
                        </button>

                    )}




                    {/* Cancel */}

                    {["pending","approved","processing"].includes(status) && (

                        <button
                            onClick={() =>
                                handleAction(o.id,"cancel")
                            }
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        >
                            Cancel
                        </button>

                    )}




                    <button
                        onClick={() => openEdit(o)}
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded"
                    >
                        <Edit size={16}/>
                    </button>



                    <button
                        onClick={() => handleDelete(o.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 size={16}/>
                    </button>


                </div>

            </td>

        </tr>

    );

})}



{orders.length === 0 && (

<tr>

<td
colSpan="6"
className="px-4 py-8 text-center text-gray-400"
>

No purchase orders found

</td>

</tr>

)}

</tbody>


</table>


</div>


</div>

);

}