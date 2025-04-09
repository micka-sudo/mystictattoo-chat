// src/components/SEO.js
import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, url, image }) => {
    return (
        <Helmet>
            <title>{ title }</title>
            <meta name="description" content={ description } />
            <link rel="canonical" href={ url } />
            {/* Open Graph */}
            <meta property="og:title" content={ title } />
            <meta property="og:description" content={ description } />
            <meta property="og:url" content={ url } />
            { image && <meta property="og:image" content={ image } /> }
            {/* Twitter Card */}
            <meta name="twitter:title" content={ title } />
            <meta name="twitter:description" content={ description } />
        </Helmet>
    );
};

export default SEO;
