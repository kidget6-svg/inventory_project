import { useLanguage } from "../context/LanguageContext"; // resources/js/pages/PrescriptionSales.jsx
//
// Prescription Sales — Pharmacy POS terminal.
//
// Displays medicine cards on the left and a sticky "Prescription Draft"
// panel on the right.  The draft panel contains selected medicines,
// quantity controls (+/-), remove-item, total price, Clear Draft, and
// Send to Cashier Queue.
//
// The pharmacist can enter prescription/patient information (patient name,
// prescription number, doctor name, notes) before dispatching the order.
// The pharmacist does NOT complete payment or finalize the sale — the
// draft is sent to the Cashier Payment Queue for the cashier to process.
//
// All shared UI is provided by the reusable components in
// resources/js/components/pos/.

import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PosProductCard,
  PosCartPanel,
  PosInfoModal,
  PosPagination } from
'../components/pos';
import {
  Search,
  FileText,
  Send,
  Pill,
  User,
  Phone,
  Mail,
  Clipboard } from
'lucide-react';

export default function PrescriptionSales() {const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const canDispense = hasPermission('prescription-sales.dispense');
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination (client-side, operates on filtered results)
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Prescription / patient information
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Prescription & Patient Information modal (opened before sending to cashier queue)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // ── Data loading ──────────────────────────────────────────────
  useEffect(() => {
    api.get('/medicines', { params: { per_page: 100 } }).
    then((res) => {
      const list = Array.isArray(res.data?.data) ? res.data.data :
      Array.isArray(res.data?.medicines?.data) ? res.data.medicines.data :
      Array.isArray(res.data) ? res.data : [];
      setMedicines(list);
    }).
    catch((err) => {
      console.error('Failed to load medicines:', err);
      window.showToast(t("Failed to load medicines"), 'error');
    }).
    finally(() => setLoading(false));
  }, []);

  // Reset to first page whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ── Cart helpers ────────────────────────────────────────────
  const priceOf = (m) => Number(m.selling_price ?? m.unit_price ?? 0);

  const addToCart = (med) => {
    if (med.quantity <= 0) {
      return window.showToast(t("Out of stock"), 'error');
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id);
      if (existing) {
        if (existing.cartQty + 1 > med.quantity) {
          window.showToast(`Stock limit reached (${med.quantity})`, 'error');
          return prev;
        }
        return prev.map((item) =>
        item.id === med.id ?
        { ...item, cartQty: item.cartQty + 1 } :
        item
        );
      }
      return [...prev, { ...med, cartQty: 1 }];
    });
  };

  const incrementQty = (item, maxStock) => {
    setCart((prev) => prev.map((i) => {
      if (i.id === item.id) {
        if (i.cartQty + 1 > maxStock) {
          window.showToast(`Stock limit reached (${maxStock})`, 'error');
          return i;
        }
        return { ...i, cartQty: i.cartQty + 1 };
      }
      return i;
    }));
  };

  const decrementQty = (item) => {
    setCart((prev) => prev.map((i) =>
    i.id === item.id ?
    { ...i, cartQty: Math.max(1, i.cartQty - 1) } :
    i
    ));
  };

  const removeFromCart = (item) =>
  setCart((prev) => prev.filter((i) => i.id !== item.id));

  const clearDraft = () => setCart([]);

  const totalCalculated = cart.reduce(
    (sum, item) => sum + priceOf(item) * (item.cartQty || 0),
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.cartQty || 0),
    0
  );

  // ── Submit ────────────────────────────────────────────────────
  // Clicking "Send to Cashier Queue" first opens the Prescription &
  // Patient Information modal.  The actual API call happens only
  // after the user confirms the information in the modal.
  const handleSendToCashier = () => {
    if (cart.length === 0) {
      return window.showToast(t("Cart is empty"), 'error');
    }
    if (cart.some((i) => i.cartQty <= 0)) {
      return window.showToast(t("All items must have quantity > 0"), 'error');
    }

    setShowPrescriptionModal(true);
  };

  const confirmSendToCashier = async () => {
    if (!patientName.trim()) {
      return window.showToast(t("Patient Name is required"), 'error');
    }
    if (!patientPhone.trim()) {
      return window.showToast(t("Phone Number is required"), 'error');
    }

    setSubmitting(true);
    try {
      await api.post('/sales/prescription', {
        items: cart.map((item) => ({
          medicine_id: item.id,
          quantity: item.cartQty
        })),
        // Prescription / patient information
        customer_name: patientName,
        customer_phone: patientPhone,
        customer_email: patientEmail || null
      });

      window.showToast(t("Order dispatched to Cashier queue!"), 'success');
      setCart([]);
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setShowPrescriptionModal(false);
    } catch (err) {
      window.showToast(
        err.response?.data?.message || 'Failed to send order',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Search filter ────────────────────────────────────────────
  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.generic_name?.toLowerCase().includes(q) ||
      m.barcode?.toLowerCase().includes(q));

  });

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <LoadingSpinner text={t("Opening prescription terminal...")} />;
  }

  return (
    <div className="pos-layout">
            {/* ── Left: Medicine Selection ── */}
            <div className="pos-main">
                {/* Page header */}
                <div className="pos-page-header">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                            <Pill size={22} className="text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{t("Prescription Sales")}

              </h2>
                            <p className="text-sm text-gray-500">{t("Dispense medications and send to cashier queue")}

              </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
              type="text"
              placeholder={t("Search medication...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pos-search-input" />
            
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>

                {/* Medicine cards */}
                {filtered.length === 0 ?
        <div className="text-center py-12 text-gray-400">
                        <Pill size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">{t("No medications found")}</p>
                        <p className="text-xs mt-1">{t("Try adjusting your search terms")}

          </p>
                    </div> :

        <div className="pos-product-grid">
                        {paginatedItems.map((med) =>
          <PosProductCard
            key={med.id}
            item={med}
            price={priceOf(med)}
            onAdd={addToCart}
            addLabel="Add to Prescription"
            image={med.image_url}
            imageAlt={med.name} />

          )}
                    </div>
        }

                {/* Pagination */}
                {filtered.length > 0 &&
        <PosPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage} />

        }
            </div>

            {/* ── Right: Prescription Draft (sticky) ── */}
            <div className="pos-sidebar">
                <PosCartPanel
          title={t("Prescription Draft")}
          titleIcon={FileText}
          titleColor="text-sky-600"
          headerBg="bg-sky-50"
          headerBorder="border-sky-200"
          clearLabel="Clear Draft"
          onClear={clearDraft}
          items={cart}
          priceOf={priceOf}
          onIncrement={incrementQty}
          onDecrement={decrementQty}
          onRemove={removeFromCart}
          showQtyInput={false}
          total={totalCalculated}
          totalItems={totalItems}
          actionIcon={Send}
          actionLabel="Send to Cashier Queue"
          onAction={handleSendToCashier}
          actionDisabled={cart.length === 0 || submitting}
          actionLoading={submitting}
          actionHidden={!canDispense}
          emptyMessage="Prescription draft is empty"
          emptySubMessage="Select medicines from the list to begin"
          emptyIcon={FileText} />
        
            </div>

            {/* Prescription & Patient Information modal */}
            <PosInfoModal
        open={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title={t("Prescription & Patient Information")}
        titleIcon={Clipboard}
        titleColor="text-sky-600"
        fields={[
        { name: 'patientName', label: 'Patient Name', icon: User, placeholder: 'Enter patient name' },
        { name: 'patientPhone', label: 'Phone Number', icon: Phone, phone: true, placeholder: 'Enter phone number' },
        { name: 'patientEmail', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'Enter email address' }]
        }
        values={{ patientName, patientPhone, patientEmail }}
        onChange={(key, value) => {
          if (key === 'patientName') setPatientName(value);else
          if (key === 'patientPhone') setPatientPhone(value);else
          if (key === 'patientEmail') setPatientEmail(value);
        }}
        onConfirm={confirmSendToCashier}
        confirmLabel="Confirm & Send to Cashier Queue"
        submitting={submitting} />
      
        </div>);

}