// resources/js/pages/SalesCheckout.jsx
//
// Sales Checkout — Cashier focus.
//
// Shows every order dispatched from the Sales page (medicine, retail and
// OTC) with separate tabs for Medicine vs Retail & OTC. Cashiers process
// payment, generate the receipt and complete the sale here.

import React from 'react';
import CashierPaymentQueue from '../components/CashierPaymentQueue';

export default function SalesCheckout() {
    return (
        <div className="w-full">
            <CashierPaymentQueue showTypeTabs />
        </div>
    );
}