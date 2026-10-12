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
//
// Phone-number validation (Ethiopian format) is opt-in: a field
// definition may set `phoneValidation: true` to enable digit-only
// input filtering, live format validation, an inline error message,
// and disabling of the confirm button until the number is valid.
//
// Number-only validation is also opt-in: a field definition may set
// `numberValidation: true` to enable digit-only input filtering, an
// inline error message, and disabling of the confirm button until the
// value contains only digits.

import React, { useState } from 'react';
import Modal from '../Modal';

// ── Ethiopian phone-number validation ──────────────────────────────
// Accepts:
//   09XXXXXXXX       (10 digits, local format)
//   +2519XXXXXXXX    (13 characters, international format)
const ETHIOPIAN_PHONE_REGEX = /^(\+2519\d{8}|09\d{8})$/;

/**
 * Strip every character that is not a digit or a leading "+".
 * The "+" is only permitted as the very first character so that the
 * international prefix (+251) can be entered.
 */
const filterPhoneInput = (value) => {
    // Remove everything that is not a digit or "+"
    let filtered = value.replace(/[^\d+]/g, '');
    // Keep "+" only at position 0
    const hasPlus = filtered.startsWith('+');
    filtered = filtered.replace(/\+/g, '');
    return hasPlus ? '+' + filtered : filtered;
};

/**
 * Returns true when the value is a valid Ethiopian phone number.
 */
const isValidEthiopianPhone = (value) => {
    if (!value) return false;
    return ETHIOPIAN_PHONE_REGEX.test(value);
};

/**
 * Strip every character that is not a digit.
 * Used for TIN / number-only fields.
 */
const filterNumberInput = (value) => {
    return value.replace(/[^\d]/g, '');
};

/**
 * Returns true when the value contains only digits (or is empty).
 */
const isValidNumber = (value) => {
    if (!value) return true; // empty is valid — the field is optional
    return /^\d+$/.test(value);
};

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
    // Track which fields the user has interacted with so we
    // only show inline errors after the field is "touched".
    const [touchedFields, setTouchedFields] = useState({});

    const handleFieldChange = (key, value, field) => {
        if (field?.phoneValidation) {
            // Immediately reject letters, spaces, and other text —
            // keep only digits and an optional leading "+".
            const filtered = filterPhoneInput(value);
            setTouchedFields((prev) => ({ ...prev, [key]: true }));
            if (onChange) onChange(key, filtered);
        } else if (field?.numberValidation) {
            // Immediately reject letters, spaces, and other non-digit
            // characters — keep only digits.
            const filtered = filterNumberInput(value);
            setTouchedFields((prev) => ({ ...prev, [key]: true }));
            if (onChange) onChange(key, filtered);
        } else {
            if (onChange) onChange(key, value);
        }
    };

    // A phone field is considered invalid when it has a value that
    // does not match the Ethiopian format, or when it is empty after
    // being touched.
    const phoneFieldError = (field) => {
        if (!field.phoneValidation) return null;
        const val = values[field.name] ?? '';
        if (!touchedFields[field.name]) return null;
        if (!val) return 'Phone number is required';
        if (!isValidEthiopianPhone(val)) {
            return 'Enter a valid Ethiopian phone number (09XXXXXXXX or +2519XXXXXXXX)';
        }
        return null;
    };

    // A number field is considered invalid when it contains any
    // non-digit characters.
    const numberFieldError = (field) => {
        if (!field.numberValidation) return null;
        const val = values[field.name] ?? '';
        if (!touchedFields[field.name]) return null;
        if (!isValidNumber(val)) {
            return 'TIN Number must contain digits only';
        }
        return null;
    };

    // Disable the confirm button when any phone field is invalid.
    const hasInvalidPhone = fields.some(
        (field) =>
            field.phoneValidation &&
            !isValidEthiopianPhone(values[field.name] ?? '')
    );

    // Disable the confirm button when any number field is invalid.
    const hasInvalidNumber = fields.some(
        (field) =>
            field.numberValidation &&
            !isValidNumber(values[field.name] ?? '')
    );

    const confirmDisabled = submitting || hasInvalidPhone || hasInvalidNumber;

    return (
        <Modal open={open} onClose={onClose} title={title} size="max-w-lg">
            <div className="space-y-4">
                {fields.map((field) => {
                    const Icon = field.icon;
                    const value = values[field.name] ?? '';
                    const isPhoneField = field.phoneValidation;
                    const isNumberField = field.numberValidation;
                    const error = isPhoneField
                        ? phoneFieldError(field)
                        : isNumberField
                            ? numberFieldError(field)
                            : null;
                    const hasError = !!error;

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
                                        handleFieldChange(field.name, e.target.value, field)
                                    }
                                    onBlur={() =>
                                        setTouchedFields((prev) => ({
                                            ...prev,
                                            [field.name]: true,
                                        }))
                                    }
                                    placeholder={field.placeholder || ''}
                                    className={`w-full ${
                                        Icon ? 'pl-10' : 'pl-3'
                                    } pr-3 py-2 border rounded-xl text-sm focus:ring-2 outline-none transition-all duration-200 placeholder:text-gray-400 ${
                                        hasError
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:ring-sky-500 focus:border-sky-500'
                                    }`}
                                />
                            </div>
                            {hasError && (
                                <p className="mt-1 text-xs text-red-600">
                                    {error}
                                </p>
                            )}
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
                        disabled={confirmDisabled}
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
