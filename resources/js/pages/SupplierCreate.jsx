/**
 * SupplierCreate.jsx – Create supplier form with full frontend + backend validation.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { FieldError, FieldErrorsSummary } from '../components/FieldError';
import { useAuth } from '../context/AuthContext';
import { useValidation } from '../hooks/useValidation';
import { supplierFormSchema } from '../utils/validation';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function SupplierCreate() {
    const navigate = useNavigate();
    const { can, loading: authLoading } = useAuth();
    const canManage = can('suppliers.manage');

    const {
        values: form,
        errors,
        handleChange,
        validate,
        setErrors,
        clearErrors,
    } = useValidation(supplierFormSchema, {
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !canManage) {
            window.showToast('You do not have permission to create suppliers', 'error');
            navigate('/suppliers');
        }
    }, [authLoading, canManage, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Pre-submit frontend validation — prevents submission if invalid
        if (validate()) return;

        setSubmitting(true);
        clearErrors();

        try {
            await api.post('/suppliers', form);
            window.showToast('Supplier created successfully', 'success');
            navigate('/suppliers');
        } catch (err) {
            if (err.response?.status === 422) {
                const backendErrors = err.response?.data?.errors;
                if (backendErrors) {
                    setErrors(backendErrors);
                    window.showToast('Please fix the validation errors below', 'error');
                }
            } else {
                const errorMsg = err.response?.data?.message || 'Error saving supplier';
                window.showToast(errorMsg, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !canManage) return <LoadingSpinner text="Checking permissions..." />;

    const inputCls = (field) => `w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
        errors[field] ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
    }`;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/suppliers"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Suppliers
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Add New Supplier</h1>
            </div>

            <div className="card p-6">
                <FieldErrorsSummary errors={errors} />
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                        <input
                            name="name"
                            value={form.name || ''}
                            onChange={handleChange}
                            className={inputCls('name')}
                            required
                        />
                        <FieldError name="name" errors={errors} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Person *</label>
                        <input
                            name="contact_person"
                            value={form.contact_person || ''}
                            onChange={handleChange}
                            className={inputCls('contact_person')}
                            required
                        />
                        <FieldError name="contact_person" errors={errors} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                        <input
                            name="phone"
                            value={form.phone || ''}
                            onChange={handleChange}
                            className={inputCls('phone')}
                            required
                        />
                        <FieldError name="phone" errors={errors} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email || ''}
                            onChange={handleChange}
                            className={inputCls('email')}
                            placeholder="supplier@example.com"
                        />
                        <FieldError name="email" errors={errors} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Address *</label>
                        <textarea
                            name="address"
                            value={form.address || ''}
                            onChange={handleChange}
                            rows="3"
                            className={inputCls('address')}
                            required
                        />
                        <FieldError name="address" errors={errors} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link to="/suppliers" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><Save size={16} /> Create Supplier</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
