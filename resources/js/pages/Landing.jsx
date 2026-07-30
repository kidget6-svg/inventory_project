import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, LogIn, UserPlus, ShieldCheck, Users, Package, BarChart3 } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-blue-50 flex flex-col">
            <div className="relative flex-1 flex flex-col">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/landing page.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-100/80 via-blue-50/60 to-blue-50/90" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                <Pill size={22} className="text-blue-600" />
                            </div>
                            <span className="text-lg font-bold text-blue-800 tracking-tight">PharmaSys</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
                            >
                                <LogIn size={16} /> Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                            >
                                <UserPlus size={16} /> Register
                            </Link>
                        </div>
                    </nav>

                    <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
                        <div className="text-center max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-sm text-blue-700 shadow-sm mb-6">
                                <ShieldCheck size={14} className="text-blue-500" />
                                Pharmacy Inventory Management System
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900 leading-tight tracking-tight">
                                Manage Your Pharmacy<br />
                                <span className="text-blue-600">with Confidence</span>
                            </h1>
                            <p className="mt-4 text-lg text-blue-700/80 max-w-lg mx-auto leading-relaxed">
                                Track medicines, manage suppliers, process sales, and monitor stock levels — all in one secure platform.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/register"
                                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <UserPlus size={20} /> Get Started
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-8 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-semibold rounded-xl shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <LogIn size={20} /> Sign In
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
                        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-5">
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { icon: Package, label: 'Medicine Tracking' },
                                    { icon: Users, label: 'Role-based Access' },
                                    { icon: BarChart3, label: 'Sales & Reports' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 justify-center">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <item.icon size={16} className="text-blue-600" />
                                        </div>
                                        <span className="text-sm text-blue-700 font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
