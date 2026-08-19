import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Unified, responsive pagination control shared by every page/table.
 *
 * Props (any one source is enough):
 *   - meta            : server-side Laravel paginator ({ current_page, last_page, per_page, total })
 *   - currentPage / totalPages / totalItems / itemsPerPage : client-side pagination values
 *
 * onPageChange always receives the 1-based page number to navigate to.
 */
export default function Pagination({
    meta,
    currentPage: currentPageProp,
    totalPages: totalPagesProp,
    totalItems: totalItemsProp,
    itemsPerPage: itemsPerPageProp,
    onPageChange,
}) {
    const current_page = meta?.current_page ?? currentPageProp ?? 1;
    const last_page = meta?.last_page ?? totalPagesProp ?? 1;
    const per_page = meta?.per_page ?? itemsPerPageProp ?? 0;
    const total = meta?.total ?? totalItemsProp ?? 0;

    if (!onPageChange) return null;
    if (last_page <= 1) return null;

    const start = (current_page - 1) * per_page + 1;
    const end = Math.min(current_page * per_page, total);

    const showSummary = total > 0 && per_page > 0;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > last_page) {
        endPage = last_page;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let p = startPage; p <= endPage; p++) pages.push(p);

    const btnBase = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200';
    const btnNav = `${btnBase} text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed`;
    const btnPage = `${btnBase} text-sky-600 bg-white border border-gray-200 hover:bg-sky-50`;
    const btnPageActive = `${btnBase} bg-sky-600 text-white`;
    const ellipsis = 'px-2 text-sm text-gray-400';

    return (
        <div className="pagination mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {showSummary && (
                <span className="text-sm text-gray-600">
                    Showing {start} to {end} of {total} results
                </span>
            )}
            <div className="inline-flex items-center flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, current_page - 1))}
                    disabled={current_page === 1}
                    className={btnNav}
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                {startPage > 1 && (
                    <button type="button" onClick={() => onPageChange(1)} className={btnPage}>
                        1
                    </button>
                )}

                {startPage > 2 && <span className={ellipsis}>…</span>}

                {pages.map(p => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={p === current_page ? btnPageActive : btnPage}
                    >
                        {p}
                    </button>
                ))}

                {endPage < last_page - 1 && <span className={ellipsis}>…</span>}

                {endPage < last_page && (
                    <button type="button" onClick={() => onPageChange(last_page)} className={btnPage}>
                        {last_page}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(last_page, current_page + 1))}
                    disabled={current_page === last_page}
                    className={btnNav}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
