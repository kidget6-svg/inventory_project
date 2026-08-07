// resources/js/components/pos/PosConfig.js
//
// Shared configuration for the Pharmacy POS system.
// Both Prescription Sales and Retail Sales import from this single
// source of truth so that payment methods, labels, and icons stay
// consistent across the entire application.

import {
    Banknote,
    CreditCard,
    Smartphone,
    Building,
    DollarSign,
} from 'lucide-react';

// ── Payment methods ──────────────────────────────────────────────
// Each entry maps a backend `payment_method` value to a human-readable
// label and a lucide-react icon component.
export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'telebirr', label: 'Telebirr', icon: Smartphone },
    { value: 'cbe', label: 'Commercial Bank of Ethiopia (CBE)', icon: Building },
    { value: 'boa', label: 'Bank of Abyssinia (BOA)', icon: Building },
    { value: 'awash', label: 'Awash Bank', icon: Building },
    { value: 'dashen', label: 'Dashen Bank', icon: Building },
    { value: 'coop', label: 'Cooperative Bank of Oromia (Coop)', icon: Building },
    { value: 'wegagen', label: 'Wegagen Bank', icon: Building },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'other', label: 'Other', icon: DollarSign },
];

// ── Payment labels (value → label string) ────────────────────────
export const PAYMENT_LABELS = PAYMENT_METHODS.reduce(
    (acc, pm) => {
        acc[pm.value] = pm.label;
        return acc;
    },
    {}
);

// ── Helpers ──────────────────────────────────────────────────────
export function getPaymentLabel(value) {
    return PAYMENT_LABELS[value] || value || '—';
}

export function getPaymentIcon(value) {
    const method = PAYMENT_METHODS.find(pm => pm.value === value);
    return method ? method.icon : DollarSign;
}
