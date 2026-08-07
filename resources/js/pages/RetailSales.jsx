// resources/js/pages/RetailSales.jsx
//
// Retail Sales — Cashier Payment Queue.
//
// Cashiers see only the incoming pharmacist-dispatched retail orders
// and complete payment from this screen.  Product browsing, cart,
// checkout, and receipt modals are handled exclusively by the
// CashierPaymentQueue component.

import React from 'react';
import CashierPaymentQueue from '../components/CashierPaymentQueue';

export default function RetailSales() {
    return (
        <div className="w-full">
            <CashierPaymentQueue />
        </div>
    );
}
