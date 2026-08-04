import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose && onClose(), 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-sky-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-sky-500" />,
    };

    const styles = {
        success: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800' },
        error: { bg: 'bg-red-50 border-red-200', text: 'text-red-800' },
        info: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800' },
    };

    const s = styles[type] || styles.success;

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 ${s.bg} ${s.text} ${
            visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            {icons[type]}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={() => { setVisible(false); setTimeout(() => onClose && onClose(), 300); }} className="ml-2 hover:opacity-70 transition-opacity">
                <X size={16} />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    useEffect(() => { window.showToast = addToast; }, []);

    return (
        <>
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => removeToast(toast.id)} />
            ))}
        </>
    );
}
