import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function CategoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { can, loading: authLoading } = useAuth();
    const canManage = can('categories.manage');

    const [form, setForm] = useState({ name: '', description: '', shelf_location: '' });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [shelves, setShelves] = useState([]);

    // Redirect if user lacks permission
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await api.get('/user');
                if (response.data.role !== 'admin') {
                    window.showToast('Only admins can edit categories', 'error');
                    navigate('/categories');
                    return;
                }
                setIsAdmin(true);
            } catch (err) {
                window.showToast('Unauthorized access', 'error');
                navigate('/categories');
            }
        };
        checkAdmin();
    }, [navigate]);

    // Load shelves for dropdown
    useEffect(() => {
        if (!isAdmin) return;
        api.get('/shelves')
            .then(r => {
                const data = r.data;
                setShelves(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                window.showToast('Failed to load shelves', 'error');
            });
    }, [isAdmin]);

    useEffect(() => {
        if (canManage) {
            api.get(`/categories/${id}`)
                .then(r => setForm({
                    name: r.data.name,
                    description: r.data.description || '',
                    shelf_location: r.data.shelf_location || ''
                }))
                .catch(() => setError('Failed to load category'))
                .finally(() => setLoading(false));
        }
    }, [id, canManage]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear field-level error when user starts typing
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});
        setSubmitting(true);
        try {
            await api.put(`/categories/${id}`, form);
            window.showToast('Category updated successfully', 'success');
            navigate('/categories');
        } catch (err) {
            if (err.response?.status === 422) {
                const errors = err.response?.data?.errors;
                if (errors) {
                    setValidationErrors(errors);
                    const firstError = Object.values(errors).flat()[0];
                    window.showToast(firstError, 'error');
                }
                setError('Please fix the validation errors below');
            } else {
                const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Error saving category';
                setError(errorMsg);
                window.showToast(errorMsg, 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !canManage) return <LoadingSpinner text="Checking permissions..." />;
    if (loading) return <LoadingSpinner text="Loading category..." />;

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
                <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
            </div>

            <div className="card p-6">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm border border-red-100">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                validationErrors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                            }`}
                            required
                        />
                        {validationErrors.name && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.name[0]}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Shelf Location</label>
                        <select
                            name="shelf_location"
                            value={form.shelf_location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none bg-white"
                        >
                            <option value="">Select Shelf</option>
                            {shelves.map(shelf => (
                                <option key={shelf.id} value={shelf.shelf_location}>
                                    {shelf.name} ({shelf.shelf_location})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none ${
                                validationErrors.description ? 'border-red-400 focus:border-red-400' : 'border-gray-200'
                            }`}
                        />
                        {validationErrors.description && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.description[0]}</p>
                        )}
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
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save size={16} /> Update Category</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
