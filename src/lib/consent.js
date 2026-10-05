import { useEffect, useState } from 'react';

/**
 * Consentement aux traceurs publicitaires (Google Ads).
 * Valeurs : 'granted', 'denied' ou null (pas encore choisi).
 */
const STORAGE_KEY = 'cookie_consent';
const CONSENT_EVENT = 'cookie-consent-change';

export const getConsent = () => {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value === 'granted' || value === 'denied' ? value : null;
    } catch {
        return null;
    }
};

export const setConsent = (value) => {
    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch {
        // Stockage indisponible : le choix vaut pour cette page seulement
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
};

export const isAdminSession = () => {
    try {
        return Boolean(localStorage.getItem('admin_token'));
    } catch {
        return false;
    }
};

export const useConsent = () => {
    const [consent, setConsentState] = useState(getConsent);

    useEffect(() => {
        const onChange = (event) => setConsentState(event.detail ?? getConsent());
        window.addEventListener(CONSENT_EVENT, onChange);
        return () => window.removeEventListener(CONSENT_EVENT, onChange);
    }, []);

    return consent;
};
