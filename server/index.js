const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Routes
const uploadRoute = require('./routes/upload');
const authRoute = require('./routes/auth');
const mediaRoute = require('./routes/media');

const app = express();
const PORT = 4000;

// ✅ Middleware CORS : autorise les appels depuis React (localhost:3000 ou autres)
app.use(cors());

// ✅ Middleware JSON (à placer AVANT les routes qui lisent le body)
app.use(express.json());

// ✅ Dossier /uploads pour fichiers
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// ✅ Routes API (bon ordre maintenant)
app.use('/api/login', authRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/media', mediaRoute); // ✅ déplacé ici

// ✅ Route GET "/" pour test
app.get('/', (req, res) => {
    res.send('🚀 Backend Mystic Tattoo en ligne');
});

// ✅ Lancement serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
});
