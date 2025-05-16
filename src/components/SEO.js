// src/components/SEO.js
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

/**
 * SEO
 * @param {string} title - Balise <title> de la page
 * @param {string} description - Balise meta description
 * @param {string} url - Canonical URL
 * @param {string} image - Image Open Graph/Twitter
 * @param {string} locale - Langue du site
 * @param {string} keywords - Mots-clés principaux séparés par des virgules
 */
const SEO = ({
                 title = 'Mystic Tattoo - Tatoueur Nancy, Salon de tatouage à Nancy 54000',
                 description = "Mystic Tattoo - Salon de tatouage artistique à Nancy (54000). Tatoueur expérimenté. Prise de rendez-vous en ligne. Styles : oldschool, réaliste, graphique, japonais, minimaliste. Galerie, tarifs, contact.",
                 url = 'https://www.mystic-tattoo.fr',
                 image = 'https://www.mystic-tattoo.fr/og-image.jpg',
                 locale = 'fr_FR',
                 keywords = "tatoueur Nancy, salon de tatouage Nancy, tatouage Nancy, tatouage artistique, tattoo Nancy, meilleur tatoueur Nancy, Mystic Tattoo"
             }) => {
    return (
        <HelmetProvider>
            <Helmet>
                <html lang="fr" />
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <link rel="canonical" href={url} />

                {/* Open Graph */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={url} />
                <meta property="og:locale" content={locale} />
                {image && <meta property="og:image" content={image} />}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                {image && <meta name="twitter:image" content={image} />}
            </Helmet>
        </HelmetProvider>
    );
};

export default SEO;
