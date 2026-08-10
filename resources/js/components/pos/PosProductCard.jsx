// resources/js/components/pos/PosProductCard.jsx
//
// Reusable product / medicine card used on both the Prescription Sales
// and Retail Sales POS pages.  The same component renders a medicine
// card (Rx) and an OTC / cosmetic product card — only the props differ.

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function PosProductCard({
    item,
    price,
    onAdd,
    addLabel = 'Add to Cart',
    addIcon: AddIcon = Plus,
    image,
    imageAlt = 'Product image',
}) {
    const stock = Number(item.quantity ?? 0);
    const unitPrice = Number(price ?? 0);
    const inStock = stock > 0;
    const [imgError, setImgError] = useState(false);

    return (
        <div className="pos-card group flex flex-col h-full">
            {/* Image / Icon area */}
            <div className="relative mb-3 flex items-center justify-center h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                {image && !imgError ? (
                    <img
                        src={image}
                        alt={imageAlt}
                        className="h-full w-full object-cover object-center"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-300">
                        <AddIcon size={32} />
                    </div>
                )}

                {/* Stock badge */}
                <span
                    className={`absolute top-2 right-2 pos-badge text-xs font-semibold ${
                        inStock
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {inStock ? `Stock: ${stock}` : 'Out of Stock'}
                </span>
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5 truncate">
                    {item.name}
                </h3>
                <p className="text-xs text-gray-400 mb-2 truncate">
                    {item.category?.name || item.category || item.generic_name || 'Uncategorised'}
                </p>

                <div className="mt-auto flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-700 text-sm">
                        ${unitPrice.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Add button */}
            <button
                type="button"
                onClick={() => onAdd(item)}
                disabled={!inStock}
                className="pos-btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Plus size={14} />
                {addLabel}
            </button>
        </div>
    );
}
