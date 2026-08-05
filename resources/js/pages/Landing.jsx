import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import logo from "../assets/pharmacy-logo.jpg";

export default function Landing() {
    return (
        <div className="relative min-h-screen overflow-hidden">

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/landing page.png')",
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-100/70 backdrop-blur-sm" />

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* ================= Navbar ================= */}
                <nav className="flex items-center justify-between px-6 lg:px-12 py-5">

                    {/* Logo */}
                    <div className="flex items-center gap-4">

                         <img
    src={logo}
    alt="PharmaSys Logo"
    className="w-12 h-12 rounded-xl bg-white shadow object-contain"
/>
                        <div>
                            <h1 className="text-4xl font-extrabold text-blue-800 tracking-wide">
                                EPIS
                            </h1>

                            <p className="text-gray-700 text-lg">
                                Pharmacy Inventory Management System
                            </p>
                        </div>

                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-4">

                        <Link
                            to="/login"
                            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
                        >
                            <LogIn size={20} />
                            Sign In
                        </Link>

                        <Link
                            to="/register"
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-800"
                        >
                            <UserPlus size={20} />
                            Register
                        </Link>

                    </div>

                </nav>

                {/* ================= Hero ================= */}

                <div className="flex flex-1 items-center justify-center px-6">

                    <div className="max-w-4xl text-center">

                        <h2 className="text-5xl font-extrabold leading-tight text-blue-900 md:text-6xl">
                            Welcome to
                            <br />
                            <span className="text-blue-700">
                                EPIS Pharmacy System
                            </span>
                        </h2>

                        <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-gray-700">
                            Streamline inventory management, monitor medicine
                            stock, track sales and purchases, manage suppliers,
                            and generate reports—all from one secure and
                            user-friendly platform.
                        </p>

                       

                    </div>

                </div>

            </div>
        </div>
    );
}
