import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft, Lock } from 'lucide-react';

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 text-center p-8">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-red-600" />
                </div>

                {/* Status Code */}
                <h1 className="text-6xl font-extrabold text-red-600 mb-2">403</h1>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h2>

                {/* Message */}
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page or perform this action.
                    Please contact your administrator if you believe this is an error.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                        <Home size={16} />
                        Dashboard
                    </Link>
                </div>

                {/* Lock icon decoration */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <Lock className="w-5 h-5 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-400 mt-2">Your access level does not permit this operation.</p>
                </div>
            </div>
        </div>
    );
}
