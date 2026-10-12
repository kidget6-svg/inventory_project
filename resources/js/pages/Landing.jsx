import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Package, ShoppingCart, AlertTriangle, Users, TrendingUp, Shield } from 'lucide-react';
import { useLanguage } from "../context/LanguageContext";

export default function Landing() {
    const { t } = useLanguage();

    const features = [
        {
            icon: <Package size={24} className="text-sky-500" />,
            title: t("Medicine Management"),
            description: t("Comprehensive medicine catalog with batch tracking, expiry monitoring, and multi-location inventory.")
        },
        {
            icon: <ShoppingCart size={24} className="text-blue-500" />,
            title: t("Sales & POS"),
            description: t("Seamless prescription and retail sales with integrated checkout and receipt generation.")
        },
        {
            icon: <AlertTriangle size={24} className="text-amber-500" />,
            title: t("Stock Alerts"),
            description: t("Automated low-stock and expiry alerts keep your pharmacy safe and compliant.")
        },
        {
            icon: <TrendingUp size={24} className="text-emerald-500" />,
            title: t("Analytics & Reports"),
            description: t("Real-time dashboards with sales analytics and inventory insights across branches.")
        },
        {
            icon: <Users size={24} className="text-purple-500" />,
            title: t("Multi-Branch Support"),
            description: t("Manage multiple pharmacy branches with centralized control and role-based access.")
        },
        {
            icon: <Shield size={24} className="text-indigo-500" />,
            title: t("Secure Access Control"),
            description: t("Granular permission system ensuring only authorized staff access sensitive data.")
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background: 100% Fullscreen */}
            <div
                className="absolute inset-0 bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/landing_fullscreen.png?v=4')",
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center center"
                }}
            />
            <div className="absolute inset-0 bg-sky-950/10" />

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 lg:px-12 py-5">
                    {/* Logo + Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl ring-2 ring-sky-400/70 transform hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                            <img src="/images/p1.png" alt={t("EthioPharmacy")} className="w-14 h-14 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800">{t("EthioPharmacy")}</h1>
                            <p className="text-sm text-gray-600">{t("Smart Pharmacy Inventory System")}</p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 bg-white rounded-xl shadow text-blue-700 font-semibold flex items-center gap-2 hover:bg-blue-50">
                            <LogIn size={18} />{t("Sign In")}
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 bg-blue-600 rounded-xl shadow text-white font-semibold flex items-center gap-2 hover:bg-blue-700">
                            <UserPlus size={18} />{t("Register")}
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex-1 flex items-center justify-center px-1">
                    <div className="text-center max-w-3xl">
                        <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 leading-tight">
                            {t("EthioPharmacy")}
                            <br />
                            <span className="text-blue-600">{t("Smart Pharmacy Inventory System")}</span>
                        </h2>

                        {/* Feature Highlights */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/60 backdrop-blur-sm rounded-xl p-5 shadow-md border border-white/50 hover:bg-white/80 transition-all duration-200 text-left">
                                    <div className="flex items-center gap-3">
                                        {feature.icon}
                                        <h3 className="font-semibold text-blue-900">{feature.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Call to Action */}
                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-3 bg-blue-600 rounded-xl shadow text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                                <LogIn size={18} />{t("Get Started")}
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-3 bg-white rounded-xl shadow text-blue-700 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                <UserPlus size={18} />{t("Create Account")}
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
