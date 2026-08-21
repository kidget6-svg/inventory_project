import { useLanguage } from "../context/LanguageContext";import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import PhoneInput from '../components/PhoneInput';
import { ArrowLeft, Save, X } from 'lucide-react';

const fields = [
['name', 'Name'],
['contact_person', 'Contact Person'],
['phone', 'Phone'],
['email', 'Email'],
['address', 'Address']];


export default function SupplierCreate() {const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/suppliers', form);
      window.showToast(t("Supplier created successfully"), 'success');
      navigate('/suppliers');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          
                    <ArrowLeft size={16} />{t("Back to Suppliers")}

        </Link>
                <h1 className="text-2xl font-bold text-gray-800">{t("Add New Supplier")}</h1>
            </div>

            <div className="card p-6">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map(([name, label]) =>
          <div key={name} className={name === 'address' ? 'md:col-span-2' : ''}>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}{name === 'name' && ' *'}</label>
                            {name === 'phone' ?
              <PhoneInput
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" /> :

              <input
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                required={name === 'name'} />}
            
                        </div>
          )}
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link to="/suppliers" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />{t("Cancel")}

            </Link>
                        <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60">
              
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><Save size={16} />{t("Create Supplier")}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>);

}