import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Your backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach the token from localStorage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;