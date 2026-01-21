// components/agenda/Calendar.tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/lib/api';

export default function Calendar() {
    const queryClient = useQueryClient();
    const { data: appointments = [] } = useQuery(['appointments'], fetchAppointments);

    const createMut = useMutation(createAppointment, {
        onSuccess: () => queryClient.invalidateQueries(['appointments']),
    });
    const updateMut = useMutation(({ id, ...rest }: any) => updateAppointment(id, rest), {
        onSuccess: () => queryClient.invalidateQueries(['appointments']),
    });
    const deleteMut = useMutation(deleteAppointment, {
        onSuccess: () => queryClient.invalidateQueries(['appointments']),
    });

    const events = appointments.map((a: any) => ({
        id: a.id,
        title: `${a.patientName} - ${a.type}`,
        start: `${a.date}T${a.startTime}`,
        end: `${a.date}T${a.endTime}`,
        backgroundColor: a.status === 'confirmed' ? '#34D399' : a.status === 'pending' ? '#FBBF24' : '#EF4444',
    }));

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        const title = prompt('Nome do paciente');
        if (title) {
            const newAppt = {
                patientId: 'unknown',
                patientName: title,
                date: selectInfo.startStr.split('T')[0],
                startTime: selectInfo.startStr.split('T')[1].substring(0, 5),
                endTime: selectInfo.endStr.split('T')[1].substring(0, 5),
                duration: 30,
                type: 'first_visit',
                status: 'pending',
                notes: '',
            };
            createMut.mutate(newAppt);
        }
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        if (window.confirm(`Excluir o agendamento "${clickInfo.event.title}"?`)) {
            deleteMut.mutate(clickInfo.event.id);
        }
    };

    const handleEventDrop = (eventDropInfo: any) => {
        const ev = eventDropInfo.event as EventApi;
        const updated = {
            date: ev.startStr.split('T')[0],
            startTime: ev.startStr.split('T')[1].substring(0, 5),
            endTime: ev.endStr.split('T')[1].substring(0, 5),
        };
        updateMut.mutate({ id: ev.id, ...updated });
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            selectable={true}
            select={handleDateSelect}
            events={events}
            eventClick={handleEventClick}
            editable={true}
            eventDrop={handleEventDrop}
            height="auto"
        />
    );
}
