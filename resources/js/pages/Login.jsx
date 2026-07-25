import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Pill, Loader2 } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            const msgs = err.response?.data?.errors;
            setError(msgs ? Object.values(msgs).flat().join(' ') : 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-100 flex items-center justify-center px-4">

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">

                {/* LEFT SIDE */}
                <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-12">

                    <div className="bg-white/20 p-6 rounded-full">
                        <Pill size={70} />
                    </div>

                    <h1 className="text-4xl font-bold mt-8">
                        Pharmacy Inventory
                    </h1>

                    <p className="mt-5 text-blue-100 text-center leading-relaxed">
                        Manage medicines, suppliers, purchases,
                        sales and inventory with a secure,
                        fast and modern dashboard.
                    </p>

                    <img
                        src="/images/pharmacy.svg"
                        alt="Pharmacy"
                        className="w-80 mt-10"
                    />

                </div>

                {/* RIGHT SIDE */}
                <div className="p-8 md:p-12 flex items-center">

                    <div className="w-full">

                        <div className="text-center mb-8">

                            <div className="inline-flex bg-blue-100 p-4 rounded-full">

                                <Pill
                                    className="text-blue-600"
                                    size={35}
                                />

                            </div>

                            <h2 className="text-3xl font-bold mt-4">
                                Welcome Back
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Login to your account
                            </p>

                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Email */}

                            <div>

                                <label className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>

                                <div className="relative">

                                    <Mail
                                        className="absolute left-4 top-3.5 text-gray-400"
                                        size={18}
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Enter email"
                                        required
                                    />

                                </div>

                            </div>

                            {/* Password */}

                            <div>

                                <label className="block text-sm font-medium mb-2">
                                    Password
                                </label>

                                <div className="relative">

                                    <Lock
                                        className="absolute left-4 top-3.5 text-gray-400"
                                        size={18}
                                    />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Enter password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* Button */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition flex justify-center items-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>
    );
}
