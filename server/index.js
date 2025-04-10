const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const uploadRoute = require('./routes/upload');
const authRoute = require('./routes/auth');


const app = express();
const PORT = 4000;

// ✅ Middleware CORS : autorise les appels depuis React (localhost:3000 ou autres)
app.use(cors());
app.use('/api/login', authRoute);


// ✅ Middleware JSON
app.use(express.json());

// ✅ Middleware pour servir les fichiers dans /uploads
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// ✅ Route d'upload API
app.use('/api/upload', uploadRoute);

// ✅ Optionnel : route GET "/" pour voir que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('🚀 Backend Mystic Tattoo en ligne');
});

// ✅ Démarrage serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`);
});
