import { useLanguage } from "../context/LanguageContext";import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function CategoryEdit() {const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('categories.edit');
  const [form, setForm] = useState({ name: '', description: '', shelf_location: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user can edit categories
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!canEdit) {
          window.showToast(t("You do not have permission to edit categories"), 'error');
          navigate('/categories');
          return;
        }
      } catch (err) {
        window.showToast(t("Unauthorized access"), 'error');
        navigate('/categories');
      }
    };
    checkPermission();
  }, [navigate, canEdit]);

  useEffect(() => {
    if (canEdit) {
      api.get(`/categories/${id}`).
      then((r) => setForm({
        name: r.data.name,
        description: r.data.description || '',
        shelf_location: r.data.shelf_location || ''
      })).
      catch(() => setError(t("Failed to load category"))).
      finally(() => setLoading(false));
    }
  }, [id, canEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.put(`/categories/${id}`, form);
      window.showToast(t("Category updated successfully"), 'success');
      navigate('/categories');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text={t("Loading category...")} />;

  if (!canEdit) return null;

  return (
    <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
          to="/categories"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          
                    <ArrowLeft size={16} />{t("Back to Categories")}

        </Link>
                <h1 className="text-2xl font-bold text-gray-800">{t("Edit Category")}</h1>
            </div>

            <div className="card p-6">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-3 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Name *")}</label>
                        <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
              required />
            
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Shelf Location")}</label>
                        <input
              name="shelf_location"
              value={form.shelf_location}
              onChange={handleChange}
              placeholder={t("e.g. A-2-3")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
            
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t("Description")}</label>
                        <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none" />
            
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link to="/categories" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                            <X size={16} />{t("Cancel")}

            </Link>
                        <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60">
              
                            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save size={16} />{t("Update Category")}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>);

}