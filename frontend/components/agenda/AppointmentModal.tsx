// frontend/components/agenda/AppointmentModal.tsx
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAppointment, updateAppointment } from '../../lib/api';
import { Appointment } from '../../shared/types/index';

// Zod schema matching the Appointment interface (excluding generated fields)
const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Patient ID is required'),
    patientName: z.string().min(1, 'Patient name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time'),
    duration: z.number().int().positive(),
    type: z.enum(['first_visit', 'return', 'evaluation']),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
    /**
     * If provided, the modal works in edit mode and will call `updateAppointment`.
     * `appointmentId` is the id of the appointment to update.
     */
    appointmentId?: string;
    /**
     * Initial values for edit mode. If omitted, the form starts empty for creation.
     */
    defaultValues?: Partial<FormData>;
    /**
     * Callback after a successful create or update to allow parent components to refresh data.
     */
    onSuccess?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
    appointmentId,
    defaultValues,
    onSuccess,
}) => {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: defaultValues as any,
    });

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
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    {appointmentId ? 'Edit Appointment' : 'New Appointment'}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow-lg p-6 focus:outline-none"
                >
                    <Dialog.Title className="text-xl font-semibold mb-4">
                        {appointmentId ? 'Edit Appointment' : 'Create Appointment'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Patient ID</label>
                            <input
                                {...register('patientId')}
                                className="w-full border rounded px-2 py-1"
                            />
                            {errors.patientId && (
                                <p className="text-red-600 text-sm">{errors.patientId.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Patient Name</label>
                            <input
                                {...register('patientName')}
                                className="w-full border rounded px-2 py-1"
                            />
                            {errors.patientName && (
                                <p className="text-red-600 text-sm">{errors.patientName.message}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    {...register('date')}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.date && (
                                    <p className="text-red-600 text-sm">{errors.date.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Time</label>
                                <input
                                    type="time"
                                    {...register('startTime')}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.startTime && (
                                    <p className="text-red-600 text-sm">{errors.startTime.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">End Time</label>
                                <input
                                    type="time"
                                    {...register('endTime')}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.endTime && (
                                    <p className="text-red-600 text-sm">{errors.endTime.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    {...register('duration', { valueAsNumber: true })}
                                    className="w-full border rounded px-2 py-1"
                                />
                                {errors.duration && (
                                    <p className="text-red-600 text-sm">{errors.duration.message}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select {...register('type')} className="w-full border rounded px-2 py-1">
                                <option value="first_visit">First Visit</option>
                                <option value="return">Return</option>
                                <option value="evaluation">Evaluation</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-600 text-sm">{errors.type.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select {...register('status')} className="w-full border rounded px-2 py-1">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-600 text-sm">{errors.status.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                className="w-full border rounded px-2 py-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Dialog.Close asChild>
                                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                    Cancel
                                </button>
                            </Dialog.Close>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
