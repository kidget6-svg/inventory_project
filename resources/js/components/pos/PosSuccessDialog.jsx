import { useLanguage } from "../../context/LanguageContext"; // resources/js/components/pos/PosSuccessDialog.jsx
//
// Reusable success / confirmation dialog shown after a sale is
// completed.  Displays receipt details and offers View Receipt,
// Download PDF, Print, and Close actions.

import React from 'react';
import { CheckCircle, Receipt, Download, Printer, X } from 'lucide-react';
import Modal from '../Modal';
import { getPaymentLabel } from './PosConfig';

export default function PosSuccessDialog({
  open,
  onClose,
  sale,
  onViewReceipt,
  onDownloadPdf,
  onPrintReceipt
}) {const { t } = useLanguage();
  if (!sale) return null;

  const totalAmount = parseFloat(sale.total_amount || 0);
  const amountPaid = parseFloat(sale.amount_paid || sale.total_amount || 0);
  const changeAmount = parseFloat(sale.change_amount || 0);
  const saleDate = sale.sale_date ?
  new Date(sale.sale_date).toLocaleString() :
  '—';

  return (
    <Modal open={open} onClose={onClose} title={t("Payment Successful")} size="max-w-lg">
            <div className="space-y-4">
                {/* Success icon */}
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
                    <CheckCircle size={28} className="text-green-600" />
                </div>

                {/* Message */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{t("\u2713 Payment Successful")}

          </h3>
                    <p className="text-sm text-gray-500">{t("The sale has been completed successfully.")}

          </p>
                </div>

                {/* Sale details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Receipt Number")}</span>
                        <span className="text-sm font-medium text-gray-800">
                            {sale.receipt_number || `#${sale.id}`}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Date & Time")}</span>
                        <span className="text-sm font-medium text-gray-800">{saleDate}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Cashier")}</span>
                        <span className="text-sm font-medium text-gray-800">
                            {sale.cashier_name || 'Unknown'}
                        </span>
                    </div>

                    {sale.customer_name &&
          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{t("Customer")}</span>
                            <span className="text-sm font-medium text-gray-800">
                                {sale.customer_name}
                            </span>
                        </div>
          }

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Total Amount")}</span>
                        <span className="text-sm font-medium text-gray-800">
                            ${totalAmount.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Payment Method")}</span>
                        <span className="text-sm font-medium text-gray-800">
                            {getPaymentLabel(sale.payment_method)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Amount Paid")}</span>
                        <span className="text-sm font-medium text-gray-800">
                            ${amountPaid.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">{t("Change")}</span>
                        <span className="text-sm font-medium text-green-600">
                            ${changeAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
            type="button"
            onClick={onViewReceipt}
            className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5">
            
                        <Receipt size={14} />{t("View Receipt")}
          </button>
                    <button
            type="button"
            onClick={onDownloadPdf}
            className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5">
            
                        <Download size={14} />{t("Download PDF")}
          </button>
                    <button
            type="button"
            onClick={onPrintReceipt}
            className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5">
            
                        <Printer size={14} />{t("Print Receipt")}
          </button>
                    <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-3 py-2 text-sm flex items-center justify-center gap-1.5">
            
                        <X size={14} />{t("Close")}
          </button>
                </div>
            </div>
        </Modal>);

}