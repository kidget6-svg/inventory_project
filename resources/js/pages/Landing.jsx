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
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/pharmacy-logo.svg"
                            alt="PharmaSys Logo"
                            className="w-12 h-12 rounded-xl bg-white shadow"
                        />

                        <div>
                            <h1 className="text-3xl font-bold text-blue-800">
                               EPIS
                            </h1>

                            <p className="text-sm text-gray-600">
                                Pharmacy Inventory Management System
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
