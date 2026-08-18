// resources/js/components/pos/PosCartPanel.jsx
//
// Reusable sticky cart / draft panel.  Shared by Prescription Sales
// ("Prescription Draft") and Retail Sales ("Shopping Cart").
//
// The panel is sticky so it stays visible while the user scrolls
// through the product grid on the left.

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import PosCartItem from './PosCartItem';

export default function PosCartPanel({
    title = 'Cart',
    titleIcon: TitleIcon = ShoppingCart,
    titleColor = 'text-sky-600',
    headerBg = 'bg-sky-50',
    headerBorder = 'border-sky-200',
    clearLabel = 'Clear All',
    onClear,
    items = [],
    priceOf,
    onIncrement,
    onDecrement,
    onRemove,
    onQtyChange,
    showQtyInput = false,
    total = 0,
    totalItems = 0,
    actionLabel = 'Checkout',
    actionIcon: ActionIcon = null,
    onAction,
    actionDisabled = false,
    actionLoading = false,
    actionHidden = false,
    emptyMessage = 'Your cart is empty',
    emptySubMessage = 'Add items from the catalog to get started',
    emptyIcon: EmptyIcon = ShoppingCart,
}) {
    const hasItems = items.length > 0;

    return (
        <div className="sticky top-6 h-fit">
            <div className="pos-cart-panel">
                {/* Header */}
                <div
                    className={`pos-cart-header ${headerBg} ${headerBorder} px-5 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-2.5">
                        <TitleIcon size={20} className={titleColor} />
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    </div>

                    {hasItems && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            {clearLabel}
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {!hasItems ? (
                        <div className="text-center py-10 text-gray-400">
                            <EmptyIcon size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">{emptyMessage}</p>
                            <p className="text-xs mt-1">{emptySubMessage}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {items.map((item) => (
                                <PosCartItem
                                    key={item.id}
                                    item={item}
                                    unitPrice={priceOf(item)}
                                    cartQty={item.cartQty}
                                    maxStock={item.quantity}
                                    onIncrement={onIncrement}
                                    onDecrement={onDecrement}
                                    onRemove={onRemove}
                                    onQtyChange={onQtyChange}
                                    showQtyInput={showQtyInput}
                                />
                            ))}
                        </div>
                    )}

                    {/* Total & Action */}
                    {hasItems && (
                        <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Items ({totalItems})</span>
                                <span>${Number(total).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-700">Total Price:</span>
                                <span className="text-green-600">
                                    ${Number(total).toFixed(2)}
                                </span>
                            </div>

                            {!actionHidden && (
                                <button
                                    type="button"
                                    onClick={onAction}
                                    disabled={actionDisabled}
                                    className="w-full pos-btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {ActionIcon && <ActionIcon size={16} />}
                                    {actionLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {actionLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
