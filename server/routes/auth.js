const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); // 🔌 Charge les variables .env

const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY;
const ADMIN_HASH = process.env.ADMIN_HASH;

// ✅ Route POST /api/login
router.post('/', async (req, res) => {
    const { password } = req.body;

    try {
        // 🔐 Compare le mot de passe entré avec le hash
        const isMatch = await bcrypt.compare(password, ADMIN_HASH);

        if (!isMatch) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // ✅ Génère le token JWT
        const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token });
    } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
