import { useLanguage } from "../../context/LanguageContext"; // resources/js/components/pos/PosCartItem.jsx
//
// Reusable cart / draft line-item.  Renders a single product row with
// quantity controls (+ / -), an optional numeric input, a subtotal,
// and a remove button.  Used by both Prescription Sales and Retail Sales.

import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function PosCartItem({
  item,
  unitPrice,
  cartQty,
  maxStock,
  onIncrement,
  onDecrement,
  onRemove,
  onQtyChange,
  showQtyInput = false
}) {const { t } = useLanguage();
  const qty = Number(cartQty ?? 0);
  const price = Number(unitPrice ?? 0);
  const subtotal = price * qty;
  const remaining = maxStock - qty;

  return (
    <div className="pos-cart-item flex items-center gap-3">
            {/* Product info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                    {item.name}
                </p>
                <p className="text-xs text-gray-400">
                    ${price.toFixed(2)}{t("/ unit")}
        </p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-1">
                <button
          type="button"
          onClick={() => onDecrement(item)}
          disabled={qty <= 1}
          className="pos-qty-btn disabled:opacity-40 disabled:cursor-not-allowed"
          title={t("Decrease quantity")}>
          
                    <Minus size={14} />
                </button>

                {showQtyInput ?
        <input
          type="number"
          min={1}
          max={maxStock}
          value={qty}
          onChange={(e) => onQtyChange(item, e.target.value)}
          className="pos-qty-input w-12 text-center text-sm font-semibold" /> :


        <span className="text-sm font-semibold w-8 text-center">
                        {qty}
                    </span>
        }

                <button
          type="button"
          onClick={() => onIncrement(item, maxStock)}
          disabled={qty >= maxStock}
          className="pos-qty-btn disabled:opacity-40 disabled:cursor-not-allowed"
          title={t("Increase quantity")}>
          
                    <Plus size={14} />
                </button>
            </div>

            {/* Subtotal */}
            <span className="text-xs font-bold text-gray-700 min-w-[55px] text-right">
                ${subtotal.toFixed(2)}
            </span>

            {/* Stock remaining hint (retail only) */}
            {showQtyInput && remaining >= 0 &&
      <span className="text-xs text-gray-400 hidden sm:block">
                    {remaining} left
                </span>
      }

            {/* Remove */}
            <button
        type="button"
        onClick={() => onRemove(item)}
        className="pos-remove-btn text-red-500"
        title={t("Remove item")}>
        
                <Trash2 size={14} />
            </button>
        </div>);

}