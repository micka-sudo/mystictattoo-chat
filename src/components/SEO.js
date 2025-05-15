// src/components/SEO.js

import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const SEO = ({
                 title = 'Mystic Tattoo - Salon de tatouage à Nancy 54000',
                 description = 'Mystic Tattoo est un salon de tatouage artistique situé à Nancy. Prise de rendez-vous en ligne, galeries, styles variés et artistes passionnés.',
                 url = 'https://www.mystic-tattoo.fr',
                 image = 'https://www.mystic-tattoo.fr/og-image.jpg', // à remplacer par ton image
                 locale = 'fr_FR'
             }) => {
    return (
        <HelmetProvider>
            <Helmet>
                <html lang="fr" />
                <title>{title}</title>
                <meta name="description" content={description} />
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
