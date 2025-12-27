import ttf2woff2 from 'ttf2woff2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(__dirname, '..', 'public', 'fonts');

const ttfFiles = ['KGHolocene.ttf', 'HeavyMetalBlight.ttf', 'AmericanText.ttf'];

console.log('Converting TTF fonts to WOFF2...\n');

ttfFiles.forEach(file => {
    const ttfPath = path.join(fontsDir, file);
    if (fs.existsSync(ttfPath)) {
        const input = fs.readFileSync(ttfPath);
        const woff2 = ttf2woff2(input);
        const outPath = ttfPath.replace('.ttf', '.woff2');
        fs.writeFileSync(outPath, woff2);
        const oldSize = (fs.statSync(ttfPath).size / 1024).toFixed(0);
        const newSize = (fs.statSync(outPath).size / 1024).toFixed(0);
        const reduction = (100 - (newSize / oldSize * 100)).toFixed(0);
        console.log(`✅ ${file}: ${oldSize}KB -> ${newSize}KB (-${reduction}%)`);
    }
});

console.log('\nDone!');
