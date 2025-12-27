/**
 * Script d'optimisation des assets (images et fonts)
 * Exécuter: node scripts/optimize-assets.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const FONTS_DIR = path.join(PUBLIC_DIR, 'fonts');

// Configuration des tailles d'images responsives
const IMAGE_SIZES = [400, 800, 1200, 1600, 2000];

async function optimizeImages() {
    console.log('🖼️  Optimisation des images...\n');

    if (!fs.existsSync(IMAGES_DIR)) {
        console.log('Dossier images non trouvé');
        return;
    }

    const files = fs.readdirSync(IMAGES_DIR);
    const imageFiles = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f));

    for (const file of imageFiles) {
        const inputPath = path.join(IMAGES_DIR, file);
        const baseName = path.parse(file).name;
        const stats = fs.statSync(inputPath);

        console.log(`📁 ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        try {
            const image = sharp(inputPath);
            const metadata = await image.metadata();

            console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

            // Créer les versions optimisées
            for (const width of IMAGE_SIZES) {
                if (width > metadata.width) continue;

                // WebP
                const webpPath = path.join(IMAGES_DIR, `${baseName}-${width}w.webp`);
                await sharp(inputPath)
                    .resize(width)
                    .webp({ quality: 85 })
                    .toFile(webpPath);
                const webpStats = fs.statSync(webpPath);
                console.log(`   ✅ ${baseName}-${width}w.webp (${(webpStats.size / 1024).toFixed(0)} KB)`);

                // AVIF (meilleure compression)
                const avifPath = path.join(IMAGES_DIR, `${baseName}-${width}w.avif`);
                await sharp(inputPath)
                    .resize(width)
                    .avif({ quality: 80 })
                    .toFile(avifPath);
                const avifStats = fs.statSync(avifPath);
                console.log(`   ✅ ${baseName}-${width}w.avif (${(avifStats.size / 1024).toFixed(0)} KB)`);
            }

            // Version originale compressée en WebP
            const fullWebpPath = path.join(IMAGES_DIR, `${baseName}.webp`);
            await sharp(inputPath)
                .webp({ quality: 90 })
                .toFile(fullWebpPath);
            const fullWebpStats = fs.statSync(fullWebpPath);
            console.log(`   ✅ ${baseName}.webp (${(fullWebpStats.size / 1024).toFixed(0)} KB)`);

            console.log('');
        } catch (err) {
            console.error(`   ❌ Erreur: ${err.message}`);
        }
    }
}

async function showFontInfo() {
    console.log('🔤 Analyse des fonts...\n');

    if (!fs.existsSync(FONTS_DIR)) {
        console.log('Dossier fonts non trouvé');
        return;
    }

    const files = fs.readdirSync(FONTS_DIR);
    let totalSize = 0;

    for (const file of files) {
        const filePath = path.join(FONTS_DIR, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;

        const sizeKB = (stats.size / 1024).toFixed(0);
        const ext = path.extname(file).toLowerCase();

        let status = '';
        if (ext === '.ttf' && stats.size > 100000) {
            status = ' ⚠️  Devrait être converti en WOFF2';
        } else if (ext === '.woff2') {
            status = ' ✅ Optimisé';
        } else if (ext === '.woff') {
            status = ' 🔄 Peut être converti en WOFF2';
        }

        console.log(`   ${file}: ${sizeKB} KB${status}`);
    }

    console.log(`\n   Total: ${(totalSize / 1024).toFixed(0)} KB`);
    console.log('\n💡 Pour optimiser KGHolocene.ttf:');
    console.log('   1. Utiliser https://transfonter.org/ pour convertir en WOFF2');
    console.log('   2. Ou utiliser fonttools: pip install fonttools && pyftsubset');
    console.log('   3. Subsetter uniquement les caractères utilisés (A-Z, a-z, 0-9, accents français)');
}

async function createOptimizedHeroComponent() {
    console.log('\n📝 Création du composant OptimizedImage...\n');

    const componentCode = `/**
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
    const basePath = src.replace(/\\.(png|jpg|jpeg)$/i, '');

    // Générer les srcSet pour chaque format
    const avifSrcSet = widths.map(w => \`\${basePath}-\${w}w.avif \${w}w\`).join(', ');
    const webpSrcSet = widths.map(w => \`\${basePath}-\${w}w.webp \${w}w\`).join(', ');

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
`;

    const componentPath = path.join(__dirname, '..', 'src', 'components', 'OptimizedImage.js');
    fs.writeFileSync(componentPath, componentCode);
    console.log(`   ✅ Créé: src/components/OptimizedImage.js`);
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('           OPTIMISATION DES ASSETS - MYSTIC TATTOO         ');
    console.log('═══════════════════════════════════════════════════════════\n');

    await optimizeImages();
    await showFontInfo();
    await createOptimizedHeroComponent();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                    OPTIMISATION TERMINÉE                   ');
    console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
