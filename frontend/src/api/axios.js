import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Instance publique pour les routes sans authentification
export const publicApi = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Si c'est un FormData, supprimer le Content-Type par défaut pour laisser axios le gérer
    if (config.data instanceof FormData) {
        // Si Content-Type est défini explicitement dans la requête, le garder
        // Sinon, axios le définira automatiquement avec la boundary
        if (!config.headers['Content-Type'] || config.headers['Content-Type'] === 'application/json') {
            delete config.headers['Content-Type'];
        }
    }
    return config;
});

export default api;

