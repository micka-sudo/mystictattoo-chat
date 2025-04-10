const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const baseDir = path.join(__dirname, '../uploads');

// ✅ Route /api/media : retourne les fichiers (images et vidéos) des catégories
router.get('/', (req, res) => {
    const result = [];

    if (!fs.existsSync(baseDir)) return res.json([]);

    const categories = fs.readdirSync(baseDir);

    categories.forEach((cat) => {
        const catPath = path.join(baseDir, cat);
        if (fs.lstatSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).map((file) => ({
                file,
                category: cat,
                type: /\.(mp4|webm)$/i.test(file) ? 'video' : 'image',
                url: `/uploads/${cat}/${file}`,
            }));
            result.push(...files);
        }
    });

    res.json(result);
});

// ✅ Route /api/media/categories : retourne la liste des catégories (dossiers)
router.get('/categories', (req, res) => {
    if (!fs.existsSync(baseDir)) return res.json([]);

    const categories = fs
        .readdirSync(baseDir)
        .filter((dir) => fs.lstatSync(path.join(baseDir, dir)).isDirectory());

    res.json(categories);
});

module.exports = router;
