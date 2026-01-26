// lib/api.ts
import axios from 'axios';

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Garante que a URL tenha protocolo (https por padrão em produção)
if (process.env.NODE_ENV === 'production' && !baseURL.startsWith('http')) {
    baseURL = `https://${baseURL}`;
}

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor para debugging
// Interceptor de Requisição (Request)
api.interceptors.request.use(request => {
    console.log(`🚀 [API Request] ${request.method?.toUpperCase()} ${request.url}`, {
        baseURL: request.baseURL,
        headers: request.headers,
        params: request.params,
        data: request.data
    });
    return request;
});

// Interceptor de Resposta (Response)
api.interceptors.response.use(
    response => {
        console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    error => {
        console.error('❌ [API Error Details]:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            baseURL: error.config?.baseURL, // Verificar se está undefined ou correto
            fullUrl: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            responseData: error.response?.data, // Dados do erro vindos do backend
        });
        return Promise.reject(error);
    }
);

// Appointments
export const fetchAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const createAppointment = async (appointment: any) => {
    const response = await api.post('/appointments', appointment);
    return response.data;
};

export const updateAppointment = async (id: string, data: any) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
};

export const deleteAppointment = async (id: string) => {
    await api.delete(`/appointments/${id}`);
};

export const fetchAvailableSlots = async (date: string) => {
    const response = await api.get('/appointments/available-slots', { params: { date } });
    return response.data;
};


export const sendReminder = async (id: string) => {
    const response = await api.post(`/appointments/${id}/send-reminder`);
    return response.data;
};

<<<<<<< HEAD
export default api;
=======
// Users
export const fetchUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const fetchUser = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (user: any) => {
    const response = await api.post('/users', user);
    return response.data;
};

export const updateUser = async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
};

// Intercurrences (Sentinel)
export const fetchIntercurrences = async () => {
    const response = await api.get('/intercurrences');
    return response.data;
};

export const createIntercurrence = async (data: any) => {
    const response = await api.post('/intercurrences', data);
    return response.data;
};

export const updateIntercurrenceStatus = async (id: string, status: string, aiAnalysis?: any) => {
    const response = await api.put(`/intercurrences/${id}`, { status, aiAnalysis });
    return response.data;
};

// Knowledge Base
export const generateKnowledge = async (rawText: string) => {
    const response = await api.post('/knowledge/generate', { rawText });
    return response.data;
};

export const saveKnowledge = async (data: any) => {
    const response = await api.post('/knowledge', data);
    return response.data;
};

export const fetchKnowledge = async () => {
    const response = await api.get('/knowledge');
    return response.data;
};
>>>>>>> b90ac17 (feat: Knowledge Base Module - Notion+Firebase Sync)
