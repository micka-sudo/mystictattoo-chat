const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const baseDir = path.join(__dirname, '../uploads');

// ✅ Route /api/media/categories
router.get('/categories', (req, res) => {
    if (!fs.existsSync(baseDir)) return res.json([]);

    const categories = fs
        .readdirSync(baseDir)
        .filter((dir) =>
            fs.lstatSync(path.join(baseDir, dir)).isDirectory()
        );

    res.json(categories);
});

module.exports = router;
