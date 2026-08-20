import { useLanguage } from "../context/LanguageContext"; // resources/js/pages/StockMovementView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Package, Calendar, User } from 'lucide-react';

export default function StockMovementView() {const { t } = useLanguage();
  const { id } = useParams();
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/stock-movements/${id}`).
    then((r) => setMovement(r.data)).
    finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/stock-movements" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <ArrowLeft size={16} />{t("Back")}
        </Link>
                <h1 className="text-2xl font-bold text-gray-800">{t("Movement #")}{id}</h1>
            </div>
            {movement &&
      <div className="card p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-semibold text-gray-500">{t("Type")}</label><p className="text-gray-800">{movement.type}</p></div>
                        <div><label className="text-xs font-semibold text-gray-500">{t("Quantity")}</label><p className="text-gray-800">{movement.quantity}</p></div>
                        <div><label className="text-xs font-semibold text-gray-500">{t("Medicine")}</label><p className="text-gray-800">{movement.medicine?.name || 'N/A'}</p></div>
                        <div><label className="text-xs font-semibold text-gray-500">{t("User")}</label><p className="text-gray-800">{movement.user?.name || 'System'}</p></div>
                        <div className="col-span-2"><label className="text-xs font-semibold text-gray-500">{t("Date")}</label><p className="text-gray-800">{new Date(movement.created_at).toLocaleString()}</p></div>
                        <div className="col-span-2"><label className="text-xs font-semibold text-gray-500">{t("Notes")}</label><p className="text-gray-800">{movement.notes || '---'}</p></div>
                    </div>
                </div>
      }
        </div>);

}