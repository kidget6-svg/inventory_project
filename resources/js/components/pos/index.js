// resources/js/components/pos/index.js
//
// Barrel export — import everything from a single entry point so both
// Prescription Sales and Retail Sales pages share the exact same
// JavaScript modules.

export { default as PosProductCard } from './PosProductCard';
export { default as PosCartItem } from './PosCartItem';
export { default as PosCartPanel } from './PosCartPanel';
export { default as PosPaymentModal } from './PosPaymentModal';
export { default as PosSuccessDialog } from './PosSuccessDialog';
export { default as PosInfoModal } from './PosInfoModal';

export {
    PAYMENT_METHODS,
    PAYMENT_LABELS,
    getPaymentLabel,
    getPaymentIcon,
} from './PosConfig';
