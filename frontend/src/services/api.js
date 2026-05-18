import axios from 'axios';

// Backend server address (Defaulting to 5000, can be pulled from env if needed)
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to automatically add Authorization and Language headers to every request
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    const lang = localStorage.getItem('language') || 'en';
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Accept-Language'] = lang;
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor to catch 401 unauthorized access errors in responses
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.includes('/login')) {
        // Only logout and redirect if we are NOT on the login page
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
