import axios from 'axios';

// Création de l'instance axios avec baseURL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

// ✅ Intercepteur pour ajouter le token à chaque requête sortante
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

export default api;
