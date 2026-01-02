import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Default to local proxy or placeholder

const api = axios.create({
    baseURL: API_URL,
});

export interface CreateDiscoveryRequest {
    prompt: string;
}

export const createDiscovery = async (prompt: string) => {
    const response = await api.post('/discoveries', { prompt });
    return response.data;
};

export const getDiscovery = async (id: string) => {
    const response = await api.get(`/discoveries/${id}`);
    return response.data;
};

export const getNode = async (id: string) => {
    const response = await api.get(`/nodes/${id}`);
    return response.data;
};

export const getNodeChildren = async (id: string) => {
    const response = await api.get(`/nodes/${id}/children`);
    return response.data;
};

export default api;
