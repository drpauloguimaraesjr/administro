// lib/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
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

export default api;
