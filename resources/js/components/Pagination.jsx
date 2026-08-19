import React from 'react';

export default function Pagination({ meta, onPageChange }) {
    if (!meta) return null;

    const { current_page, last_page, per_page, total } = meta;
    if (last_page <= 1) return null;

    const start = (current_page - 1) * per_page + 1;
    const end = Math.min(current_page * per_page, total);

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > last_page) {
        endPage = last_page;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let p = startPage; p <= endPage; p++) pages.push(p);

    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">Showing {start} to {end} of {total} results</div>
            <div className="inline-flex items-center space-x-1">
                <button
                    onClick={() => onPageChange(Math.max(1, current_page - 1))}
                    disabled={current_page === 1}
                    className={`px-3 py-1 rounded ${current_page === 1 ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-600' : 'text-sky-600 bg-white hover:bg-sky-50 dark:bg-gray-800 dark:text-sky-400 dark:hover:bg-gray-700 dark:border dark:border-gray-700'} text-sm`}
                >
                    Previous
                </button>

                {startPage > 1 && (
                    <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded text-sm text-sky-600 bg-white hover:bg-sky-50 dark:bg-gray-800 dark:text-sky-400 dark:hover:bg-gray-700 dark:border dark:border-gray-700">1</button>
                )}

                {startPage > 2 && <span className="px-2 text-gray-500 dark:text-gray-400">…</span>}

                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1 rounded text-sm ${p === current_page ? 'bg-sky-600 text-white dark:bg-sky-500 dark:text-white' : 'text-sky-600 bg-white hover:bg-sky-50 dark:bg-gray-800 dark:text-sky-400 dark:hover:bg-gray-700 dark:border dark:border-gray-700'}`}
                    >
                        {p}
                    </button>
                ))}

                {endPage < last_page - 1 && <span className="px-2 text-gray-500 dark:text-gray-400">…</span>}

                {endPage < last_page && (
                    <button onClick={() => onPageChange(last_page)} className="px-3 py-1 rounded text-sm text-sky-600 bg-white hover:bg-sky-50 dark:bg-gray-800 dark:text-sky-400 dark:hover:bg-gray-700 dark:border dark:border-gray-700">{last_page}</button>
                )}

                <button
                    onClick={() => onPageChange(Math.min(last_page, current_page + 1))}
                    disabled={current_page === last_page}
                    className={`px-3 py-1 rounded ${current_page === last_page ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-600' : 'text-sky-600 bg-white hover:bg-sky-50 dark:bg-gray-800 dark:text-sky-400 dark:hover:bg-gray-700 dark:border dark:border-gray-700'} text-sm`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
