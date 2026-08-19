// resources/js/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import api from '../axios';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Login States
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Remember Me State
    const [rememberMe, setRememberMe] = useState(false);

    // Forgot Password States
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: request code, 2: verify code & reset
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetSuccessMessage, setResetSuccessMessage] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    // Prefill credentials if Remember Me was selected previously
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        const savedPassword = localStorage.getItem('remembered_password');
        if (savedEmail) {
            setForm({ email: savedEmail, password: savedPassword || '' });
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResetSuccessMessage(''); // Clear previous messages
        setLoading(true);
        try {
            await login(form.email, form.password);
            
            if (rememberMe) {
                localStorage.setItem('remembered_email', form.email);
                localStorage.setItem('remembered_password', form.password);
            } else {
                localStorage.removeItem('remembered_email');
                localStorage.removeItem('remembered_password');
            }
            
            navigate('/dashboard');
        } catch (err) {
            const backendMessage = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors;
            const message = backendMessage
                ? backendMessage
                : validationErrors
                    ? Object.values(validationErrors).flat().join(' ')
                    : 'Invalid email or password';

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const toggleResetMode = () => {
        setIsResetMode(!isResetMode);
        setResetStep(1);
        setResetError('');
        setResetSuccessMessage('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
        if (!isResetMode) {
            setResetEmail(form.email);
        }
    };

    const handleSendResetCode = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccessMessage('');
        setResetLoading(true);
        try {
            const response = await api.post('/password/forgot', { email: resetEmail });
            setResetSuccessMessage(response.data.message || 'Reset code sent to your email.');
            setResetStep(2);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Failed to send reset code. Please verify your email.';
            setResetError(msg);
        } finally {
            setResetLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setResetError('Passwords do not match.');
            return;
        }

        setResetLoading(true);
        try {
            const response = await api.post('/password/reset', {
                email: resetEmail,
                token: resetCode,
                password: newPassword,
                password_confirmation: confirmPassword
            });

            // Password reset successful: return to login view and show success notification
            setError('');
            setIsResetMode(false);
            setResetStep(1);
            setForm({ email: resetEmail, password: '' });
            setResetSuccessMessage(response.data.message || 'Password has been reset successfully. Please sign in.');
        } catch (err) {
            const msg = err.response?.data?.message || 
                        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '') || 
                        'Failed to reset password. Please check the code and try again.';
            setResetError(msg);
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 login-form-container">
                    {!isResetMode ? (
                        <>
                            {/* Logo */}
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 shadow-2xl ring-2 ring-sky-400/70 transform hover:scale-105 transition-transform duration-200">
                                    <img src="/images/sidebar.png" alt="EthioPharmacy" className="w-16 h-16 object-contain" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                                <p className="text-gray-500 mt-1.5 text-sm">Sign in to your account</p>
                            </div>
                            </div>

                            {resetSuccessMessage && (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    {resetSuccessMessage}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)} 
                                            className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm pb-1">
                                    <label className="flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                        />
                                        <span className="text-gray-600">Remember Me</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={toggleResetMode}
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Signing In...</>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Reset Password Header */}
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 shadow-2xl ring-2 ring-sky-400/70 transform hover:scale-105 transition-transform duration-200">
                                    <KeyRound className="w-10 h-10 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Your Password</h2>
                                <p className="text-gray-500 mt-1.5 text-sm">
                                    {resetStep === 1 
                                        ? 'Enter your email to receive a 6-digit reset code.' 
                                        : 'Enter the code sent to your email and your new password.'
                                    }
                                </p>
                            </div>

                            {resetError && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {resetError}
                                </div>
                            )}

                            {resetSuccessMessage && (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    {resetSuccessMessage}
                                </div>
                            )}

                            {resetStep === 1 ? (
                                <form onSubmit={handleSendResetCode} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={resetLoading} 
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {resetLoading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Sending Code...</>
                                        ) : (
                                            'Send Reset Code'
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={toggleResetMode}
                                        className="w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <ArrowLeft size={16} /> Back to Login
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={resetCode}
                                                onChange={(e) => setResetCode(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all tracking-widest text-center font-bold text-lg"
                                                placeholder="123456"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={resetLoading} 
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {resetLoading ? (
                                            <><Loader2 size={18} className="animate-spin" /> Resetting...</>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>

                                    <div className="flex justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setResetStep(1)}
                                            className="text-gray-500 hover:text-gray-700 font-semibold transition-colors"
                                        >
                                            Request new code
                                        </button>
                                        <button
                                            type="button"
                                            onClick={toggleResetMode}
                                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}