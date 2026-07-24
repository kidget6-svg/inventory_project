import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <div className="w-full max-w-md px-5">
                <div className="text-center mb-6">
                    <span className="text-4xl">{'\u{1F48A}'}</span>
                    <h1 className="text-2xl font-bold text-blue-700 mt-2">PharmaSys</h1>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>

                    {error && <div className="bg-red-50 text-red-600 border-l-4 border-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Don&apos;t have an account? <Link to="/register" className="text-blue-500 font-semibold hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
