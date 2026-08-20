import { useLanguage } from "../context/LanguageContext";import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import { User, Mail, Shield, Save } from 'lucide-react';

const roleBadgeStyle = {
  admin: 'bg-sky-100 text-sky-700',
  pharmacist: 'bg-emerald-100 text-emerald-700',
  cashier: 'bg-amber-100 text-amber-700'
};

export default function Profile() {const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // NOTE: adjust this endpoint to match your actual AuthController/UserController route
      const res = await axios.put('/api/profile', { name, email });
      if (setUser) setUser(res.data.user || { ...user, name, email });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
            <div className="card p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-900">{user?.name}</div>
                        <div className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${roleBadgeStyle[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                            {user?.role}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-6">
                <div className="card-header">{t("Edit Profile")}</div>

                {message &&
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
        message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`
        }>
                        {message.text}
                    </div>
        }

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <User size={14} />{t("Full Name")}
            </label>
                        <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required />
            
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Mail size={14} />{t("Email")}
            </label>
                        <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />
            
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Shield size={14} />{t("Role")}
            </label>
                        <input
              type="text"
              className="input-field bg-gray-50 cursor-not-allowed"
              value={user?.role || ''}
              disabled />
            
                        <p className="text-xs text-gray-400 mt-1">{t("Role can only be changed by an administrator.")}</p>
                    </div>

                    <button type="submit" className="btn-primary" disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>);

}