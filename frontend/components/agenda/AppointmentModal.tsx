// frontend/components/agenda/AppointmentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { createAppointment, updateAppointment } from '../../lib/api';
import { Appointment } from '@/shared/types/index';
import api from '@/lib/api';

// Zod schema matching the Appointment interface (excluding generated fields)
const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Selecione um paciente'),
    patientName: z.string().min(1, 'Nome do paciente é obrigatório'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido'),
    duration: z.number().int().positive(),
    type: z.enum(['first_visit', 'return', 'evaluation']),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof appointmentSchema>;

interface Patient {
    id: string;
    name: string;
    phone: string;
}

interface AppointmentModalProps {
    appointmentId?: string;
    defaultValues?: Partial<FormData>;
    onSuccess?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    appointmentId,
    defaultValues,
    onSuccess,
}) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch patients for dropdown
    const { data: patients = [] } = useQuery({
        queryKey: ['patients-dropdown'],
        queryFn: async () => {
            const res = await api.get('/patients');
            return res.data;
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: defaultValues as any,
    });

    const selectedPatientId = watch('patientId');

    // When patient is selected, auto-fill name
    const handlePatientSelect = (patient: Patient) => {
        setValue('patientId', patient.id);
        setValue('patientName', patient.name);
        setSearchTerm('');
    };

    // Filter patients based on search
    const filteredPatients = patients.filter((p: Patient) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onSubmit = async (data: FormData) => {
        try {
            if (appointmentId) {
                await updateAppointment(appointmentId, data);
            } else {
                await createAppointment(data);
            }
            onSuccess?.();
            setOpen(false);
            reset();
        } catch (e) {
            console.error('Failed to save appointment', e);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-teal-700 transition"
                >
                    {appointmentId ? 'Editar Consulta' : 'Nova Consulta'}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white   p-6 focus:outline-none max-h-[90vh] overflow-y-auto"
                >
                    <Dialog.Title className="text-xl font-semibold mb-4">
                        {appointmentId ? 'Editar Consulta' : 'Nova Consulta'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Patient Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Paciente *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                                {searchTerm && filteredPatients.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md  max-h-40 overflow-y-auto">
                                        {filteredPatients.map((patient: Patient) => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handlePatientSelect(patient)}
                                                className="w-full text-left px-3 py-2 hover:bg-muted"
                                            >
                                                <span className="font-medium">{patient.name}</span>
                                                <span className="text-sm text-muted-foreground ml-2">{patient.phone}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Hidden inputs for form */}
                            <input type="hidden" {...register('patientId')} />
                            <input type="hidden" {...register('patientName')} />

                            {/* Show selected patient */}
                            {selectedPatientId && (
                                <p className="mt-2 text-sm text-primary">
                                    ✓ Paciente selecionado: {watch('patientName')}
                                </p>
                            )}
                            {errors.patientId && (
                                <p className="text-destructive text-sm mt-1">{errors.patientId.message}</p>
                            )}
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Data *</label>
                                <input
                                    type="date"
                                    {...register('date')}
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.date && (
                                    <p className="text-destructive text-sm">{errors.date.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Horário *</label>
                                <input
                                    type="time"
                                    {...register('startTime')}
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.startTime && (
                                    <p className="text-destructive text-sm">{errors.startTime.message}</p>
                                )}
                            </div>
                        </div>

                        {/* End Time and Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Término</label>
                                <input
                                    type="time"
                                    {...register('endTime')}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Duração (min)</label>
                                <select
                                    {...register('duration', { valueAsNumber: true })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value={30}>30 min</option>
                                    <option value={45}>45 min</option>
                                    <option value={60}>60 min</option>
                                    <option value={90}>90 min</option>
                                </select>
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select {...register('type')} className="w-full border rounded px-3 py-2">
                                <option value="first_visit">Primeira Consulta</option>
                                <option value="return">Retorno</option>
                                <option value="evaluation">Avaliação</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select {...register('status')} className="w-full border rounded px-3 py-2">
                                <option value="pending">Pendente</option>
                                <option value="confirmed">Confirmado</option>
                                <option value="cancelled">Cancelado</option>
                                <option value="completed">Concluído</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Observações</label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Observações sobre a consulta..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                            <Dialog.Close asChild>
                                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Cancelar
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-teal-700 transition"
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
