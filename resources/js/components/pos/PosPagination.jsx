// resources/js/components/pos/PosPagination.jsx
//
// Reusable pagination controls for the POS product grids.
// Shared by Prescription Sales and Retail & OTC Sales pages.
//
// Renders Previous / page numbers / Next buttons plus a
// "Showing X to Y of Z results" indicator.
// Pagination operates on the already-filtered (search) result set so
// that search and pagination work together seamlessly.

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PosPagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 6,
    onPageChange,
}) {
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const goPrev = () => {
        if (hasPrev && onPageChange) {
            onPageChange(currentPage - 1);
        }
    };

    const goNext = () => {
        if (hasNext && onPageChange) {
            onPageChange(currentPage + 1);
        }
    };

    // "Showing X to Y of Z results"
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    // Page number list (mirrors the Medicines page Pagination component)
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let p = startPage; p <= endPage; p++) pages.push(p);

    return (
        <div className="pos-pagination flex items-center justify-between mt-6 mb-4">
            <div className="text-sm text-gray-600">
                Showing {start} to {end} of {totalItems} results
            </div>
            <div className="inline-flex items-center space-x-1">
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={!hasPrev}
                    className="pos-pagination-btn pos-pagination-btn-prev flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>

                {startPage > 1 && (
                    <button
                        type="button"
                        onClick={() => onPageChange && onPageChange(1)}
                        className="pos-pagination-btn pos-pagination-btn-page px-4 py-2 text-sm font-medium text-sky-600 bg-white border border-gray-200 rounded-xl hover:bg-sky-50 transition-all duration-200"
                    >
                        1
                    </button>
                )}

                {startPage > 2 && <span className="px-2 text-sm text-gray-400">…</span>}

                {pages.map(p => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange && onPageChange(p)}
                        className={`pos-pagination-btn pos-pagination-btn-page px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${p === currentPage ? 'bg-sky-600 text-white' : 'text-sky-600 bg-white border border-gray-200 hover:bg-sky-50'}`}
                    >
                        {p}
                    </button>
                ))}

                {endPage < totalPages - 1 && <span className="px-2 text-sm text-gray-400">…</span>}

                {endPage < totalPages && (
                    <button
                        type="button"
                        onClick={() => onPageChange && onPageChange(totalPages)}
                        className="pos-pagination-btn pos-pagination-btn-page px-4 py-2 text-sm font-medium text-sky-600 bg-white border border-gray-200 rounded-xl hover:bg-sky-50 transition-all duration-200"
                    >
                        {totalPages}
                    </button>
                )}

                <button
                    type="button"
                    onClick={goNext}
                    disabled={!hasNext}
                    className="pos-pagination-btn pos-pagination-btn-next flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
