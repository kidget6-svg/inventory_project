// resources/js/components/pos/PosInfoModal.jsx
//
// Reusable modal dialog for capturing customer / patient information
// before dispatching a draft to the Cashier Queue.
//
// Used by both Retail & OTC Sales ("Customer Information") and
// Prescription Sales ("Prescription & Patient Information").
//
// The modal is intentionally generic: the parent page owns the field
// state and simply passes values + change handlers down.  This keeps
// the sales / payment / database logic untouched.

import React from 'react';
import Modal from '../Modal';

export default function PosInfoModal({
    open,
    onClose,
    title = 'Customer Information',
    titleIcon: TitleIcon = null,
    titleColor = 'text-sky-600',
    fields = [],
    values = {},
    onChange,
    onConfirm,
    confirmLabel = 'Confirm & Send to Cashier Queue',
    submitting = false,
}) {
    const handleFieldChange = (key, value) => {
        if (onChange) onChange(key, value);
    };

    return (
        <Modal open={open} onClose={onClose} title={title} size="max-w-lg">
            <div className="space-y-4">
                {fields.map((field) => {
                    const Icon = field.icon;
                    const value = values[field.name] ?? '';
                    return (
                        <div key={field.name}>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {field.label}
                            </label>
                            <div className="relative">
                                {Icon && (
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                        <Icon size={14} />
                                    </span>
                                )}
                                <input
                                    type={field.type || 'text'}
                                    value={value}
                                    onChange={(e) =>
                                        handleFieldChange(field.name, e.target.value)
                                    }
                                    placeholder={field.placeholder || ''}
                                    className={`w-full ${
                                        Icon ? 'pl-10' : 'pl-3'
                                    } pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 placeholder:text-gray-400`}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 btn-secondary px-4 py-2 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 pos-btn-primary py-2 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            TitleIcon && <TitleIcon size={14} />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
