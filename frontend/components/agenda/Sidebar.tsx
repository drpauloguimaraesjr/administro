"use client";
// components/agenda/Sidebar.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAppointments } from '@/lib/api';
import { format } from 'date-fns';
import { ReminderButton } from './ReminderButton';

export default function Sidebar() {
    const { data: appointments = [] } = useQuery(['appointments'], fetchAppointments);

    // Filter appointments for today
    const today = format(new Date(), 'yyyy-MM-dd');
    const todays = appointments.filter((a: any) => a.date === today);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Compromissos de hoje</h2>
            {todays.length === 0 ? (
                <p className="text-gray-500">Nenhum agendamento</p>
            ) : (
                <ul className="space-y-2">
                    {todays.map((a: any) => (
                        <li key={a.id} className="p-2 border rounded bg-gray-50 flex justify-between items-center">
                            <div>
                                <div className="font-medium">{a.patientName}</div>
                                <div className="text-sm text-gray-600">
                                    {a.startTime} - {a.endTime} ({a.type})
                                </div>
                            </div>
                            <ReminderButton appointmentId={a.id} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
