import api from '@/lib/api';
import { User } from '@/types/user-system';

export const UsersService = {
    getAll: async () => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    create: async (data: Partial<User>) => {
        const response = await api.post<User>('/users', data);
        return response.data;
    },

    update: async (id: string, data: Partial<User>) => {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/users/${id}`);
    },

    resetPassword: async (id: string) => {
        await api.post(`/users/${id}/reset-password`);
    }
};
