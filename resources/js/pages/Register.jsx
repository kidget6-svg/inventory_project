import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'cashier' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/users');
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                        <Pill className="text-white w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mt-4">
                        Add New User
                    </h1>

                    <p className="text-gray-500 mt-2 text-center">
                        Create a new user account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Full Name
                        </label>

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
                        <label className="text-sm font-medium text-gray-700">
                            Email
                        </label>

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
                        <label className="text-sm font-medium text-gray-700">
                            Role
                        </label>

                        <div className="relative mt-1">
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                required
                            >
                                <option value="admin">Admin</option>
                                <option value="pharmacist">Pharmacist</option>
                                <option value="cashier">Cashier</option>
                            </select>
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Password
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
                                required
                                minLength={8}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

                            <input
                                type={showConfirm ? "text" : "password"}
                                name="password_confirmation"
                                value={form.password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                className="w-full pl-11 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                minLength={8}
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showConfirm ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded"
                            required
                        />

                        <span className="ml-2 text-sm text-gray-600">
                            I agree to the Terms & Conditions
                        </span>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl font-semibold shadow-lg flex justify-center items-center gap-2 disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Create User"
                        )}
                    </button>

                    {/* Back to Users */}
                    <p className="text-center text-sm text-gray-600">
                        <Link
                            to="/users"
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Back to User Management
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}
