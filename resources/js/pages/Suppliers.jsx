import React, { useState, useEffect } from 'react';
import api from '../axios';
import { Edit, Trash2, Search, X } from 'lucide-react';

export default function Suppliers() {

    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    });

    const [error, setError] = useState('');


    const load = () => {
        api.get('/suppliers')
            .then(r => setSuppliers(r.data));
    };


    useEffect(() => {
        load();
    }, []);


    const filteredSuppliers = suppliers.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.address?.toLowerCase().includes(search.toLowerCase())
    );


    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });


    const openCreate = () => {
        setForm({
            name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: ''
        });

        setEditId(null);
        setShowForm(true);
        setError('');
    };


    const openEdit = (s) => {
        setForm({
            name: s.name,
            contact_person: s.contact_person || '',
            phone: s.phone || '',
            email: s.email || '',
            address: s.address || ''
        });

        setEditId(s.id);
        setShowForm(true);
        setError('');
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {

            if (editId) {
                await api.put(`/suppliers/${editId}`, form);
            } else {
                await api.post('/suppliers', form);
            }

            setShowForm(false);
            load();

        } catch (err) {

            const msgs = err.response?.data?.errors;

            setError(
                msgs
                    ? Object.values(msgs).flat().join(' ')
                    : 'Error saving supplier'
            );
        }
    };


    const handleDelete = async (id) => {

        if (!confirm('Delete this supplier?')) return;

        await api.delete(`/suppliers/${id}`);

        load();
    };


    return (

        <div className="space-y-6">


            {/* Header + Search */}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">


                <h3 className="text-base font-semibold text-gray-700">
                    All Suppliers ({filteredSuppliers.length})
                </h3>


                <div className="flex gap-3 w-full md:w-auto">


                    <div className="relative flex-1 md:w-72">

                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                        />


                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={search}
                            onChange={(e)=>setSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />


                        {search && (

                            <button
                                onClick={()=>setSearch('')}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18}/>
                            </button>

                        )}

                    </div>



                    <button
                        onClick={openCreate}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                    >
                        + Add Supplier
                    </button>


                </div>

            </div>





            {showForm && (

                <div className="bg-white rounded-xl p-5 shadow-sm">

                    <h4 className="font-semibold text-gray-700 mb-3">
                        {editId ? 'Edit Supplier' : 'Add Supplier'}
                    </h4>


                    {error &&
                        <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">
                            {error}
                        </div>
                    }



                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >

                        {[
                            ['name','Name'],
                            ['contact_person','Contact Person'],
                            ['phone','Phone'],
                            ['email','Email'],
                            ['address','Address']
                        ].map(([name,label])=>(

                            <div
                                key={name}
                                className={name==='address'?'md:col-span-2':''}
                            >

                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    {label}
                                </label>


                                <input
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                />

                            </div>

                        ))}



                        <div className="md:col-span-2 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={()=>setShowForm(false)}
                                className="px-5 py-2 border rounded-lg text-sm"
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm"
                            >
                                {editId ? 'Update' : 'Create'}
                            </button>

                        </div>


                    </form>

                </div>

            )}







            <div className="bg-white rounded-xl shadow-sm overflow-hidden">


                <table className="w-full">


                    <thead>

                        <tr className="bg-blue-50">

                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">
                                Name
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">
                                Contact
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">
                                Phone
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-700">
                                Email
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold text-blue-700">
                                Actions
                            </th>

                        </tr>

                    </thead>




                    <tbody>


                    {filteredSuppliers.length > 0 ? (

                        filteredSuppliers.map(s=>(

                            <tr
                                key={s.id}
                                className="border-b hover:bg-blue-50/30"
                            >

                                <td className="px-4 py-3 text-sm font-medium">
                                    {s.name}
                                </td>

                                <td className="px-4 py-3 text-sm">
                                    {s.contact_person || '---'}
                                </td>

                                <td className="px-4 py-3 text-sm">
                                    {s.phone || '---'}
                                </td>

                                <td className="px-4 py-3 text-sm">
                                    {s.email || '---'}
                                </td>


                                <td className="px-4 py-3">

                                    <div className="flex justify-end gap-2">


                                        <button
                                            onClick={()=>openEdit(s)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit size={16}/>
                                        </button>


                                        <button
                                            onClick={()=>handleDelete(s.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16}/>
                                        </button>


                                    </div>

                                </td>


                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan="5"
                                className="px-4 py-8 text-center text-gray-400"
                            >
                                No suppliers found
                            </td>

                        </tr>

                    )}


                    </tbody>


                </table>


            </div>


        </div>

    );
}