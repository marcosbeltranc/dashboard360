import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    // baseURL: 'http://localhost:8000/api',
    baseURL: 'http://172.16.101.119:8000/api',
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = 'application/json';
    return config;
});

export default api;