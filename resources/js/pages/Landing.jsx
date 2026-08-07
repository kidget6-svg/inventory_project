import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/landing page.png')" }}
            />
            <div className="absolute inset-0 bg-blue-100/70 backdrop-blur-[2px]" />

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 lg:px-12 py-5">

                    {/* Logo + Title */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/images/sidebar.png"
                            alt="EthioPharmacy"
                            className="w-16 h-16 rounded-2xl bg-white shadow-2xl ring-2 ring-sky-400/70 transform hover:scale-105 transition-transform duration-200"
                        />

                        <div>
                            <h1 className="text-3xl font-bold text-blue-800">
                               EthioPharmacy
                            </h1>

                            <p className="text-sm text-gray-600">
                                Smart Pharmacy Inventory System
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 bg-white rounded-xl shadow text-blue-700 font-semibold flex items-center gap-2 hover:bg-blue-50"
                        >
                            <LogIn size={18} />
                            Sign In
                        </Link>

                        <Link
                            to="/register"
                            className="px-5 py-2.5 bg-blue-600 rounded-xl shadow text-white font-semibold flex items-center gap-2 hover:bg-blue-700"
                        >
                            <UserPlus size={18} />
                            Register
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex-1 flex items-center justify-center px-1">
                    <div className="text-center max-w-3xl">

                        <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 leading-tight">
                            Manage Your Pharmacy
                            <br />
                            <span className="text-blue-600">
                                with Confidence
                            </span>
                        </h2>





                    </div>
                </div>

            </div>
        </div>
    );
}
