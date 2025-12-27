/**
 * Composant pour images optimisées avec fallback
 * Supporte WebP, AVIF avec fallback PNG/JPG
 */
import React from 'react';

const OptimizedImage = ({
    src,
    alt,
    className,
    sizes = "100vw",
    loading = "lazy",
    widths = [400, 800, 1200, 1600, 2000]
}) => {
    // Extraire le nom de base sans extension
    const basePath = src.replace(/\.(png|jpg|jpeg)$/i, '');

    // Générer les srcSet pour chaque format
    const avifSrcSet = widths.map(w => `${basePath}-${w}w.avif ${w}w`).join(', ');
    const webpSrcSet = widths.map(w => `${basePath}-${w}w.webp ${w}w`).join(', ');

    return (
        <picture>
            <source
                type="image/avif"
                srcSet={avifSrcSet}
                sizes={sizes}
            />
            <source
                type="image/webp"
                srcSet={webpSrcSet}
                sizes={sizes}
            />
            <img
                src={src}
                alt={alt}
                className={className}
                loading={loading}
                decoding="async"
            />
        </picture>
    );
};

export default OptimizedImage;
