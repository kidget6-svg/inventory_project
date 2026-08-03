import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Edit, Trash2, Calendar, Tag } from 'lucide-react';

export default function CategoryView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/categories/${id}`)
            .then(r => setCategory(r.data))
            .catch(() => setError('Unable to load category details.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            window.showToast('Category deleted successfully', 'success');
            navigate('/categories');
        } catch (err) {
            window.showToast('Failed to delete category', 'error');
        }
    };

    if (loading) return <LoadingSpinner text="Loading category..." />;

    if (error) {
        return (
            <div className="min-h-[60vh] p-6">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
            </div>
        );
    }

    if (!category) {
        return <div className="min-h-[60vh] p-6">Category not found.</div>;
    }

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
                <h1 className="text-2xl font-bold text-gray-800">Category Details</h1>
            </div>

            <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                        <p className="text-sm font-medium text-gray-800">{category.name}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                        <p className="text-sm text-gray-600">{category.description || '---'}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Created</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {category.created_at ? new Date(category.created_at).toLocaleDateString() : '---'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Last Updated</label>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {category.updated_at ? new Date(category.updated_at).toLocaleDateString() : '---'}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                    <Link
                        to={`/categories/${category.id}/edit`}
                        className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
}
