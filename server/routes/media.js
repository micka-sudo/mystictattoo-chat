const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const baseDir = path.join(__dirname, '../uploads');

router.get('/', (req, res) => {
    const result = [];

    if (!fs.existsSync(baseDir)) {
        return res.json([]);
    }

    const categories = fs.readdirSync(baseDir);

    categories.forEach((cat) => {
        const catPath = path.join(baseDir, cat);
        if (fs.lstatSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).map((file) => ({
                file,
                category: cat,
                type: /\.(mp4|webm)$/i.test(file) ? 'video' : 'image',
                url: `/uploads/${cat}/${file}`
            }));
            result.push(...files);
        }
    });

    res.json(result);
});

module.exports = router;
