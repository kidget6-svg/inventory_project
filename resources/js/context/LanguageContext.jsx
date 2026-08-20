// resources/js/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const LANGUAGE_KEY = 'language';

const translations = {
    en: {
        'Main': 'Main',
        'Dashboard': 'Dashboard',
        'Product Management': 'Product Management',
        'Categories & Shelves': 'Categories & Shelves',
        'Medicines': 'Medicines',
        'Retail & OTC Products': 'Retail & OTC Products',
        'Inventory & Warehousing': 'Inventory & Warehousing',
        'Warehouse': 'Warehouse',
        'Branches': 'Branches',
        'Stock Movements': 'Stock Movements',
        'Stock Management': 'Stock Management',
        'Suppliers': 'Suppliers',
        'Purchase Orders': 'Purchase Orders',
        'Point of Sale': 'Point of Sale',
        'Sales': 'Sales',
        'Sales Checkout': 'Sales Checkout',
        'Reports & Analytics': 'Reports & Analytics',
        'Reports': 'Reports',
        'Sales History': 'Sales History',
        'Alerts': 'Alerts',
        'Administration': 'Administration',
        'Users': 'Users',
        'Roles & Permissions': 'Roles & Permissions',
        'Audit Logs': 'Audit Logs',
    },
    am: {
        'Main': 'ዋና',
        'Dashboard': 'ዳሽቦርድ',
        'Product Management': 'የምርት አስተዳደር',
        'Categories & Shelves': 'መደቦች እና መደርደሪያዎች',
        'Medicines': 'መድኃኒቶች',
        'Retail & OTC Products': 'የችርቻሮ እና የሐኪም ማዘዣ የሌላቸው ምርቶች',
        'Inventory & Warehousing': 'ክምችት እና መጋዘን',
        'Warehouse': 'መጋዘን',
        'Branches': 'ቅርንጫፎች',
        'Stock Movements': 'የክምችት እንቅስቃሴዎች',
        'Stock Management': 'የክምችት አስተዳደር',
        'Suppliers': 'አቅራቢዎች',
        'Purchase Orders': 'የግዢ ትዕዛዞች',
        'Point of Sale': 'የሽያጭ ቦታ',
        'Sales': 'ሽያጮች',
        'Sales Checkout': 'የሽያጭ ክፍያ',
        'Reports & Analytics': 'ሪፖርቶች እና ትንታኔዎች',
        'Reports': 'ሪፖርቶች',
        'Sales History': 'የሽያጭ ታሪክ',
        'Alerts': 'ማሳሰቢያዎች',
        'Administration': 'አስተዳደር',
        'Users': 'ተጠቃሚዎች',
        'Roles & Permissions': 'ሚናዎች እና ፈቃዶች',
        'Audit Logs': 'የኦዲት መዝገቦች',
    }
};

function getInitialLanguage() {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'en' || stored === 'am') {
        return stored;
    }
    return 'en';
}

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(getInitialLanguage);

    useEffect(() => {
        localStorage.setItem(LANGUAGE_KEY, lang);
    }, [lang]);

    const toggleLanguage = () => {
        setLang(prev => (prev === 'en' ? 'am' : 'en'));
    };

    const t = (key) => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
