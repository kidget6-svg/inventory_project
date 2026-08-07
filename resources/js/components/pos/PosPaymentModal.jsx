// resources/js/components/pos/PosPaymentModal.jsx
//
// Reusable payment modal shared by Retail Sales (and the Cashier
// dashboard).  Shows the order total, payment-method selector,
// amount-paid input with live change calculation, and Cancel /
// Confirm buttons.

import React from 'react';
import { CheckCircle, Banknote, CreditCard, Smartphone, Building, DollarSign } from 'lucide-react';
import Modal from '../Modal';
import { PAYMENT_METHODS, PAYMENT_LABELS } from './PosConfig';

export default function PosPaymentModal({
    open,
    onClose,
    title = 'Complete Payment',
    total = 0,
    itemCount = 0,
    totalUnits = 0,
    paymentMethod = 'cash',
    onPaymentMethodChange,
    amountPaid = '',
    onAmountPaidChange,
    changeAmount = 0,
    onConfirm,
    submitting = false,
    orderRef = null,
    customerName = null,
}) {
    const numericTotal = Number(total ?? 0);
    const numericPaid = parseFloat(amountPaid) || 0;
    const isCash = paymentMethod === 'cash';

    const computedChange = isCash
        ? Math.max(0, numericPaid - numericTotal)
        : 0;

    const displayChange = changeAmount !== undefined && changeAmount !== null
        ? Number(changeAmount)
        : computedChange;

    return (
        <Modal open={open} onClose={onClose} title={title} size="max-w-md">
            <div className="space-y-4">
                {/* Order summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                    {orderRef && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Order Ref</span>
                            <span className="font-bold text-gray-800">#{orderRef}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Total Amount</span>
                        <span className="text-xl font-bold text-green-600">
                            ${numericTotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Items in Cart</span>
                        <span className="text-sm font-medium text-gray-700">
                            {itemCount} item(s) ({totalUnits} units)
                        </span>
                    </div>

                    {customerName && (
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">Customer</span>
                            <span className="text-sm text-gray-700">{customerName}</span>
                        </div>
                    )}
                </div>

                {/* Payment method selector */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                        Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_METHODS.map((pm) => {
                            const Icon = pm.icon;
                            const selected = paymentMethod === pm.value;
                            return (
                                <button
                                    key={pm.value}
                                    type="button"
                                    onClick={() => onPaymentMethodChange(pm.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        selected
                                            ? 'bg-sky-500 text-white ring-2 ring-sky-500'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <Icon size={14} />
                                    {pm.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Amount paid (cash only) */}
                {isCash && (
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Amount Paid
                        </label>
                        <input
                            type="number"
                            min={numericTotal.toFixed(2)}
                            step="0.01"
                            value={amountPaid}
                            onChange={(e) => onAmountPaidChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        {displayChange > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                                Change to return:{' '}
                                <span className="font-bold text-green-600">
                                    ${displayChange.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

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
                        className="flex-1 pos-btn-primary px-4 py-2 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <CheckCircle size={14} />
                        )}
                        Confirm Payment
                    </button>
                </div>
            </div>
        </Modal>
    );
}
