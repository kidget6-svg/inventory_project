/**
 * Shared currency formatting helpers for the dashboard.
 * The application operates in Ethiopian Birr (ETB).
 */
export const CURRENCY = 'ETB';

const currencyFormatter = (decimals) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: CURRENCY,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

/**
 * Full, lossless currency string, e.g. "ETB 1,234.56".
 */
export function formatCurrency(value, { decimals = 2 } = {}) {
    return currencyFormatter(decimals).format(Number(value || 0));
}

/**
 * Compact plain number for chart axes, e.g. 1.2M / 2.5K / 350.
 */
export function formatCompact(value) {
    const n = Number(value || 0);
    if (Math.abs(n) >= 1_000_000) {
        return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (Math.abs(n) >= 1_000) {
        return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Compact currency string for stat cards / bar labels,
 * e.g. "ETB 1.2M" or "ETB 350" for small amounts.
 */
export function formatCompactCurrency(value) {
    const n = Number(value || 0);
    if (Math.abs(n) >= 1_000) {
        return `${CURRENCY} ${formatCompact(n)}`;
    }
    return formatCurrency(n, { decimals: 0 });
}