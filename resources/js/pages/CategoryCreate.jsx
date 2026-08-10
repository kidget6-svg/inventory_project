import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function CategoryCreate() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', description: '', shelf_location: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if user is admin
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await api.get('/user');
                if (response.data.role !== 'admin') {
                    window.showToast('Only admins can create categories', 'error');
                    navigate('/categories');
                    return;
                }
                setIsAdmin(true);
            } catch (err) {
                window.showToast('Unauthorized access', 'error');
                navigate('/categories');
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/categories', form);
            window.showToast('Category created successfully', 'success');
            navigate('/categories');
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving category');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner text="Checking permissions..." />;

    if (!isAdmin) return null;

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
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                        <input
                            name="shelf_location"
                            value={form.shelf_location}
                            onChange={handleChange}
                            placeholder="e.g. A-2-3"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                        />
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