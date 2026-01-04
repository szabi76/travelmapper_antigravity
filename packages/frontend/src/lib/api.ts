import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Default to local proxy or placeholder

const api = axios.create({
    baseURL: API_URL,
});

// Add interceptor to inject token
import { useLogStore } from './store';

// Add interceptor to inject token and log requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('api_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Log Request
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url;
    useLogStore.getState().addLog(`[API] -> ${method} ${url}`, 'info');

    return config;
});

// Add interceptor to log responses
api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase() || 'GET';
        const url = response.config.url;
        useLogStore.getState().addLog(`[API] <- ${method} ${url} (${response.status})`, 'success');
        return response;
    },
    (error) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'UNKNOWN';
        const status = error.response?.status || 'ERR';
        const message = error.message || 'Unknown Error';

        useLogStore.getState().addLog(`[API] !! ${method} ${url} (${status}): ${message}`, 'error');
        return Promise.reject(error);
    }
);

// Helper to strip internal prefixes (NODE#, DISCOVERY#) to avoid URL encoding issues with '#'
const cleanId = (id: string) => {
    return id.replace(/^(NODE|DISCOVERY)#/, '');
}

export interface CreateDiscoveryRequest {
    prompt: string;
}

export const createDiscovery = async (prompt: string) => {
    const response = await api.post('/discoveries', { prompt });
    return response.data;
};

export const getDiscovery = async (id: string) => {
    // Backend handles adding prefix if missing
    const response = await api.get(`/discoveries/${cleanId(id)}`);
    return response.data;
};

export const getNode = async (id: string) => {
    const response = await api.get(`/nodes/${cleanId(id)}`);
    return response.data;
};

export const getNodeChildren = async (id: string) => {
    const response = await api.get(`/nodes/${cleanId(id)}/children`);
    return response.data;
};

export const listDiscoveries = async () => {
    const response = await api.get('/discoveries');
    return response.data;
};

export const enrichNode = async (id: string) => {
    const response = await api.post(`/nodes/${cleanId(id)}/enrich`);
    return response.data;
};

export default api;
