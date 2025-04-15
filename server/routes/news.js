const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const newsFile = path.join(__dirname, '../data/news.json');

// ⚙️ Récupère toutes les actualités
router.get('/', (req, res) => {
    if (!fs.existsSync(newsFile)) fs.writeFileSync(newsFile, '[]');
    const news = JSON.parse(fs.readFileSync(newsFile));
    res.json(news);
});

// ➕ Ajoute une actualité
router.post('/', (req, res) => {
    const { title, content, date, image } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Titre et contenu requis' });

    const news = JSON.parse(fs.readFileSync(newsFile));
    const newItem = {
        id: Date.now().toString(),
        title,
        content,
        date: date || new Date().toISOString(),
        image
    };
    news.push(newItem);
    fs.writeFileSync(newsFile, JSON.stringify(news, null, 2));
    res.status(201).json(newItem);
});

// 🗑 Supprime une actualité
router.delete('/:id', (req, res) => {
    const news = JSON.parse(fs.readFileSync(newsFile));
    const updated = news.filter(item => item.id !== req.params.id);
    fs.writeFileSync(newsFile, JSON.stringify(updated, null, 2));
    res.status(204).end();
});

module.exports = router;
