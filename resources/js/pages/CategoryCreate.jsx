import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { FieldError, FieldErrorsSummary } from '../components/FieldError';
import { useAuth } from '../context/AuthContext';
import { useValidation } from '../hooks/useValidation';
import { categoryFormSchema } from '../utils/validation';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function CategoryCreate() {
    const navigate = useNavigate();
    const { can, loading: authLoading } = useAuth();
    const canManage = can('categories.manage');

    const {
        values: form,
        errors,
        handleChange,
        validate,
        setErrors,
        clearErrors,
    } = useValidation(categoryFormSchema, { name: '', description: '', shelf_location: '' });

    const [submitting, setSubmitting] = useState(false);

    // Redirect if user lacks permission
    useEffect(() => {
        if (!authLoading && !canManage) {
            window.showToast('You do not have permission to create categories', 'error');
            navigate('/categories');
        }
    }, [authLoading, canManage, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation — prevents submission if invalid
        if (validate()) return;

        setSubmitting(true);
        clearErrors();

        try {
            await api.post('/categories', form);
            window.showToast('Category created successfully', 'success');
            navigate('/categories');
        } catch (err) {
            if (err.response?.status === 422) {
                const backendErrors = err.response?.data?.errors;
                if (backendErrors) {
                    setErrors(backendErrors);
                    window.showToast('Please fix the validation errors below', 'error');
                }
            } else {
                const errorMsg = err.response?.data?.message || 'Error saving category';
                window.showToast(errorMsg, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !canManage) return <LoadingSpinner text="Checking permissions..." />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Categories
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Add New Category</h1>
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
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                            }`}
                            required
                        />
                        <FieldError name="name" errors={errors} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                        <input
                            name="shelf_location"
                            value={form.shelf_location || ''}
                            onChange={handleChange}
                            placeholder="e.g. A-2-3"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                errors.shelf_location ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                            }`}
                        />
                        <FieldError name="shelf_location" errors={errors} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description || ''}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                errors.description ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                            }`}
                        />
                        <FieldError name="description" errors={errors} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link to="/categories" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><Save size={16} /> Create Category</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
