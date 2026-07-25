import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Trash2, Edit, Save, X } from 'lucide-react';

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'cashier', label: 'Cashier' },
];

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'cashier',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
            setError('');
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const resetForm = () => {
        setForm({ name: '', email: '', password: '', password_confirmation: '', role: 'cashier' });
        setShowPassword(false);
        setShowConfirm(false);
        setEditingUser(null);
    };

    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (u) => {
        setForm({ name: u.name, email: u.email, password: '', password_confirmation: '', role: u.role });
        setShowPassword(false);
        setShowConfirm(false);
        setEditingUser(u);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, form);
            } else {
                await api.post('/register', form);
            }
            await fetchUsers();
            closeForm();
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-blue-100 text-blue-700',
            pharmacist: 'bg-green-100 text-green-700',
            cashier: 'bg-orange-100 text-orange-600',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-600'}`}>
                {role}
            </span>
        );
    };

    if (loading) return <LoadingSpinner text="Loading users..." />;

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                <button
                    onClick={openCreateForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    + Add User
                </button>
            </div>

            {/* Add/Edit User Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h3>
                        <button
                            onClick={closeForm}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Role</label>
                            <div className="relative mt-1">
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    required
                                >
                                    {roleOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Password {editingUser && '(leave blank to keep current)'}
                            </label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Password (min 8 characters)"
                                    className="w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="password_confirmation"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    className="w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-3 text-gray-500"
                                >
                                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {editingUser ? 'Saving...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.length > 0 ? users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                            {u.name?.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-800">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openEditForm(u)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {u.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
