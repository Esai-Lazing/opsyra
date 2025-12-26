import api from '../api/axios';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    logout: async () => {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setCurrentUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;

