// components/agenda/Filters.tsx
import React from 'react';
import { useState } from 'react';

export default function Filters() {
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');

    // In a full implementation, these would trigger TanStack Query refetches
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    };
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
    };

    return (
        <div className="flex space-x-2">
            <select
                value={status}
                onChange={handleStatusChange}
                className="rounded border-gray-300 p-1"
            >
                <option value="">All statuses</option>
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelado</option>
                <option value="completed">Concluído</option>
            </select>
            <select
                value={type}
                onChange={handleTypeChange}
                className="rounded border-gray-300 p-1"
            >
                <option value="">All types</option>
                <option value="first_visit">Primeira visita</option>
                <option value="return">Retorno</option>
                <option value="evaluation">Avaliação</option>
            </select>
        </div>
    );
}
