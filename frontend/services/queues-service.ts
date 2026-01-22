
import api from '@/lib/api';
import { WhatsAppQueue } from '@/types/user-system';

export const QueuesService = {
    getAll: async () => {
        const response = await api.get<WhatsAppQueue[]>('/whatsapp/queues');
        return response.data;
    },

    seed: async () => {
        await api.post('/whatsapp/queues/seed');
    },

    create: async (data: Partial<WhatsAppQueue>) => {
        const response = await api.post<WhatsAppQueue>('/whatsapp/queues', data);
        return response.data;
    },

    update: async (id: string, data: Partial<WhatsAppQueue>) => {
        const response = await api.put<WhatsAppQueue>(`/whatsapp/queues/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/whatsapp/queues/${id}`);
    }
};
