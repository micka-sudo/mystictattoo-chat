import axios from 'axios';

// Détection automatique de l'environnement
const apiBaseURL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000/api'
        : 'https://mystictattoo-api.onrender.com/api';

// Création de l'instance Axios avec baseURL dynamique
const api = axios.create({
    baseURL: apiBaseURL,
    withCredentials: true,
});

// ✅ Intercepteur pour ajouter le token admin automatiquement
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Export aussi l'URL de base "sans /api" pour afficher les médias (img/video)
export const apiBase =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000'
        : 'https://mystictattoo-api.onrender.com';

export default api;
