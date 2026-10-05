// src/components/SEO.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useConsent, isAdminSession } from '../lib/consent';
import { loadGoogleAds } from '../lib/ads';

/**
 * SEO
 * Composant centralisé pour gérer les balises <head> :
 * - Title, meta description, keywords, canonical
 * - Open Graph / Twitter Cards
 * - (Optionnel) Google Ads gtag.js via googleAdsIds, chargé seulement après consentement
 *
 * @param {string}  title        - Balise <title> de la page
 * @param {string}  description  - Balise meta description
 * @param {string}  url          - Canonical URL absolue
 * @param {string}  image        - Image Open Graph/Twitter (URL absolue)
 * @param {string}  locale       - Langue du site (ex: fr_FR)
 * @param {string}  keywords     - Mots-clés principaux séparés par des virgules
 * @param {boolean} noindex      - Si true, ajoute <meta name="robots" content="noindex,nofollow">
 * @param {string|string[]} googleAdsIds - ID ou liste d'IDs Google Ads (gtag), ex: "AW-11430070412"
 *
 * Notes:
 * - Si tu passes plusieurs IDs (array), on injecte un <script> de config pour chacun.
 * - HelmetProvider est placé une seule fois à la racine (src/index.js).
 */
const SEO = ({
                 title = 'Mystic Tattoo - Tatoueur Nancy, Salon de tatouage à Nancy 54000',
                 description = "Mystic Tattoo - Salon de tatouage artistique à Nancy (54000). Tatoueur expérimenté. Prise de rendez-vous en ligne. Styles : oldschool, réaliste, graphique, japonais, minimaliste. Galerie, tarifs, contact.",
                 url = 'https://www.mystic-tattoo.fr',
                 image = 'https://www.mystic-tattoo.fr/og-image.jpg',
                 locale = 'fr_FR',
                 keywords = 'tatoueur Nancy, salon de tatouage Nancy, tatouage Nancy, tatouage artistique, tattoo Nancy, meilleur tatoueur Nancy, Mystic Tattoo',
                 noindex = false,
                 googleAdsIds = 'AW-11430070412', // ✅ Par défaut, ton ID Google Ads fourni
             }) => {
    const consent = useConsent();
    const { pathname } = useLocation();
    const isAdminPage = pathname.startsWith('/admin');

    // Normalise: autoriser string OU array pour googleAdsIds.
    // Aucun traceur sans consentement, ni pendant une session admin.
    const trackingAllowed = consent === 'granted' && !isAdminSession() && !isAdminPage;
    const adsIds = !trackingAllowed
        ? []
        : Array.isArray(googleAdsIds)
            ? googleAdsIds.filter(Boolean)
            : (googleAdsIds ? [googleAdsIds] : []);

    // Google Ads chargé une seule fois, après consentement et jamais sur les pages admin
    const adsKey = adsIds.join(',');
    useEffect(() => {
        if (adsKey && !isAdminPage) loadGoogleAds(adsKey.split(','));
    }, [adsKey, isAdminPage]);

    return (
        <Helmet>
            {/* Lang HTML */}
            <html lang="fr" />

            {/* Title / Description / Keywords */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Indexation (optionnel) */}
            {noindex ? (
                <meta name="robots" content="noindex,nofollow" />
            ) : (
                <meta name="robots" content="index,follow" />
            )}

            {/* Canonical */}
            <link rel="canonical" href={url} />

            {/* Open Graph (Facebook, etc.) */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:locale" content={locale} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            {/* Accessoires utiles */}
            <meta name="theme-color" content="#333333" />
            <meta name="format-detection" content="telephone=no" />
        </Helmet>
    );
};

export default SEO;
