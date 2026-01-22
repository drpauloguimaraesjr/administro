
import api from '@/lib/api';
import { Lead, LeadStage } from '@/types/crm';

export const leadsService = {
    // Listar todos os leads
    getAll: async (): Promise<Lead[]> => {
        const response = await api.get('/leads');
        // Se o backend retornar num formato .data ou direto array, ajustamos aqui.
        // O axios já retorna em response.data o corpo.
        // O backend retorna res.json(leads) que é array.
        return response.data;
    },

    // Obter lead por ID
    getById: async (id: string): Promise<Lead> => {
        const response = await api.get(`/leads/${id}`);
        return response.data;
    },

    // Criar novo lead
    create: async (data: Partial<Lead>): Promise<Lead> => {
        const response = await api.post('/leads', data);
        return response.data;
    },

    // Atualizar lead completo
    update: async (id: string, data: Partial<Lead>): Promise<Lead> => {
        const response = await api.put(`/leads/${id}`, data);
        return response.data;
    },

    // Atualizar apenas o estágio (drag and drop otimizado)
    updateStage: async (id: string, stage: LeadStage): Promise<void> => {
        await api.patch(`/leads/${id}/stage`, { stage });
    },

    // Deletar lead
    delete: async (id: string): Promise<void> => {
        await api.delete(`/leads/${id}`);
    }
};
