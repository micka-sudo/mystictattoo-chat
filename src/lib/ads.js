/**
 * Chargement de Google Ads (gtag.js), une seule fois par visite.
 * Appelé uniquement après consentement, hors des pages admin.
 * Le code d'initialisation vit dans le bundle : aucun script inline nécessaire.
 */
let loaded = false;

export const loadGoogleAds = (ids) => {
    if (loaded || !ids.length || typeof window === 'undefined') return;
    loaded = true;

    window.dataLayer = window.dataLayer || [];
    // gtag doit pousser l'objet `arguments` lui-même (format attendu par gtag.js)
    window.gtag = function gtag() {
        window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
    };

    // Consent Mode v2 : le script n'est chargé qu'après « Accepter »
    window.gtag('consent', 'default', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
    });
    window.gtag('js', new Date());
    ids.forEach((id) => window.gtag('config', id));

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`;
    document.head.appendChild(script);
};
