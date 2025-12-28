/**
 * Utilitaires pour l'optimisation des images Cloudinary
 *
 * Transformations appliquées :
 * - f_auto : format automatique (WebP/AVIF selon le navigateur)
 * - q_auto : qualité automatique optimisée
 * - w_XXX : largeur adaptée à l'affichage
 * - c_limit : limite la taille sans recadrer
 */

const CLOUDINARY_REGEX = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.*)$/;

/**
 * Optimise une URL Cloudinary avec des transformations
 * @param {string} url - URL Cloudinary originale
 * @param {object} options - Options de transformation
 * @param {number} options.width - Largeur souhaitée
 * @param {number} options.height - Hauteur souhaitée (optionnel)
 * @param {string} options.quality - Qualité ('auto', 'auto:low', 'auto:eco', 'auto:good', 'auto:best')
 * @param {string} options.format - Format ('auto', 'webp', 'avif')
 * @param {string} options.crop - Mode de recadrage ('limit', 'fill', 'fit', 'scale')
 * @returns {string} URL optimisée
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
    if (!url || typeof url !== 'string') return url;

    const match = url.match(CLOUDINARY_REGEX);
    if (!match) return url; // Pas une URL Cloudinary

    const [, cloudName, pathWithVersion] = match;

    // Construire les transformations
    const transforms = [];

    // Format automatique (WebP/AVIF selon le navigateur)
    transforms.push(`f_${options.format || 'auto'}`);

    // Qualité automatique
    transforms.push(`q_${options.quality || 'auto'}`);

    // Dimensions
    if (options.width) {
        transforms.push(`w_${options.width}`);
    }
    if (options.height) {
        transforms.push(`h_${options.height}`);
    }

    // Mode de recadrage (limit = garde les proportions, ne dépasse pas les dimensions)
    if (options.width || options.height) {
        transforms.push(`c_${options.crop || 'limit'}`);
    }

    // DPR pour les écrans Retina (optionnel)
    if (options.dpr) {
        transforms.push(`dpr_${options.dpr}`);
    }

    const transformString = transforms.join(',');

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${pathWithVersion}`;
};

/**
 * Génère un srcSet pour les images responsives
 * @param {string} url - URL Cloudinary originale
 * @param {number[]} widths - Tableau de largeurs
 * @returns {string} srcSet pour l'attribut HTML
 */
export const generateSrcSet = (url, widths = [400, 800, 1200, 1600]) => {
    if (!url || !CLOUDINARY_REGEX.test(url)) return '';

    return widths
        .map(w => `${optimizeCloudinaryUrl(url, { width: w })} ${w}w`)
        .join(', ');
};

/**
 * Génère les attributs sizes pour les images responsives
 * @param {object} breakpoints - Points de rupture
 * @returns {string} Attribut sizes
 */
export const generateSizes = (breakpoints = {}) => {
    const defaults = {
        mobile: '100vw',
        tablet: '100vw',
        desktop: '1200px',
        ...breakpoints
    };

    return `(max-width: 768px) ${defaults.mobile}, (max-width: 1024px) ${defaults.tablet}, ${defaults.desktop}`;
};

/**
 * Preset pour les images hero (plein écran)
 */
export const heroImageProps = (url) => {
    if (!url || !CLOUDINARY_REGEX.test(url)) {
        return { src: url };
    }

    return {
        src: optimizeCloudinaryUrl(url, { width: 1200, quality: 'auto:good' }),
        srcSet: generateSrcSet(url, [600, 900, 1200, 1800, 2400]),
        sizes: '100vw',
    };
};

/**
 * Preset pour les thumbnails de galerie
 */
export const thumbnailImageProps = (url, size = 400) => {
    if (!url || !CLOUDINARY_REGEX.test(url)) {
        return { src: url };
    }

    return {
        src: optimizeCloudinaryUrl(url, { width: size, quality: 'auto' }),
        srcSet: generateSrcSet(url, [size, size * 1.5, size * 2]),
        sizes: `${size}px`,
    };
};

/**
 * Preset pour les images de news/articles
 */
export const articleImageProps = (url) => {
    if (!url || !CLOUDINARY_REGEX.test(url)) {
        return { src: url };
    }

    return {
        src: optimizeCloudinaryUrl(url, { width: 800, quality: 'auto' }),
        srcSet: generateSrcSet(url, [400, 600, 800, 1200]),
        sizes: '(max-width: 768px) 100vw, 800px',
    };
};

export default {
    optimizeCloudinaryUrl,
    generateSrcSet,
    generateSizes,
    heroImageProps,
    thumbnailImageProps,
    articleImageProps,
};
