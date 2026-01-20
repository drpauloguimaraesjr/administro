// src/components/agenda/ReminderButton.tsx
import React from 'react';
import { sendReminder } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReminderButtonProps {
    appointmentId: string;
}

export const ReminderButton: React.FC<ReminderButtonProps> = ({ appointmentId }) => {
    const queryClient = useQueryClient();
    const mutation = useMutation(() => sendReminder(appointmentId), {
        onSuccess: () => {
            // Invalidate appointment list to refresh reminderSent flag
            queryClient.invalidateQueries(['appointments']);
        },
    });

    const handleClick = () => {
        if (window.confirm('Enviar lembrete via WhatsApp para este agendamento?')) {
            mutation.mutate();
        }
    };

    return (
        <button
            onClick={handleClick}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            disabled={mutation.isLoading}
        >
            {mutation.isLoading ? 'Enviando...' : 'Enviar lembrete'}
        </button>
    );
};
