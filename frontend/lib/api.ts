// lib/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: { 'Content-Type': 'application/json' },
});

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
