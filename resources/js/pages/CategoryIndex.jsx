import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Plus, Edit, Trash2, Package, Tag, ChevronLeft, ChevronRight,
    Search, Filter, X
} from 'lucide-react';

export default function CategoryIndex() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';
    const [tab, setTab] = useState('categories');

    const [categories, setCategories] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const loadCategories = () => {
        setLoading(true);
        setError('');
        api.get('/categories', { params: { search } })
            .then(r => {
                const data = r.data;
                setCategories(Array.isArray(data) ? data : (data.data || []));
            })
            .catch(() => setError('Failed to load categories'))
            .finally(() => setLoading(false));
    };

    const loadShelves = () => {
        setLoading(true);
        setError('');
        api.get('/shelves', { params: { search } })
            .then(r => {
                const data = r.data;
                setShelves(Array.isArray(data) ? data : []);
            })
            .catch(() => setError('Failed to load shelves'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (tab === 'categories') {
            loadCategories();
        } else {
            loadShelves();
        }
    }, [tab, search]);

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            window.showToast('Category deleted successfully', 'success');
            loadCategories();
        } catch (err) {
            window.showToast(err.response?.data?.message || 'Failed to delete category', 'error');
        }
    };

    const getProgressColor = (percent) => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-amber-500';
        return 'bg-sky-500';
    };

    if (loading && categories.length === 0 && shelves.length === 0) {
        return <LoadingSpinner text="Loading..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {tab === 'categories' ? 'Categories' : 'Shelves'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {tab === 'categories'
                            ? 'Manage product categories and their shelf locations'
                            : 'Monitor shelf utilization and capacity'}
                    </p>
                </div>
                {tab === 'categories' && isAdmin && (
                    <button
                        onClick={() => navigate('/categories/create')}
                        className="btn-primary px-4 py-2 text-sm transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setTab('categories')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                        tab === 'categories'
                            ? 'border-sky-500 text-sky-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Categories
                </button>
                <button
                    onClick={() => setTab('shelves')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                        tab === 'shelves'
                            ? 'border-sky-500 text-sky-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Shelves
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={tab === 'categories' ? 'Search categories...' : 'Search shelves...'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* Categories Tab */}
            {tab === 'categories' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="card p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                                        <Tag className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                                        {cat.shelf_location && (
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                                                {cat.shelf_location}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => navigate(`/categories/${cat.id}/edit`)}
                                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {cat.description || 'No description provided'}
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Package size={14} />
                                    {cat.medicines_count ?? 0} medicines
                                </span>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No categories found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Shelves Tab */}
            {tab === 'shelves' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shelves.map(shelf => {
                        const percent = Math.min(100, Math.round((shelf.medicines_count / shelf.capacity) * 100));
                        const progressColor = getProgressColor(percent);
                        return (
                            <div key={shelf.id} className="card p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{shelf.name}</h3>
                                        <p className="text-xs text-gray-500">{shelf.shelf_location}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Utilization</span>
                                        <span className="font-semibold text-gray-800">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{shelf.medicines_count} items</span>
                                        <span>Capacity: {shelf.capacity}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {shelves.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No shelves found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
