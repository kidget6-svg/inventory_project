// resources/js/pages/CashierPrescriptionSales.jsx
//
// Cashier Prescription Sales — Cashier Payment Queue.
//
// Cashiers see only the incoming pharmacist-dispatched prescription orders
// and complete payment from this screen.  Medicine browsing, prescription
// creation, and order modification are not allowed here.

import React from 'react';
import CashierPaymentQueue from '../components/CashierPaymentQueue';

export default function CashierPrescriptionSales() {
    return (
        <div className="w-full">
            <CashierPaymentQueue saleType="prescription" />
        </div>
    );
}
