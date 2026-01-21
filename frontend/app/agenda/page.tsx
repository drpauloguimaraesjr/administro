// app/agenda/page.tsx
import React from 'react';
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('@/components/agenda/Calendar'), {
    ssr: false,
    loading: () => <div className="p-4">Carregando agenda...</div>
});
import Sidebar from '@/components/agenda/Sidebar';
import Filters from '@/components/agenda/Filters';

export default function AgendaPage() {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left navigation is assumed to be part of the main layout */}
            <div className="flex-1 flex flex-col">
                {/* Top bar can be added via layout */}
                <div className="p-4 flex justify-between items-center bg-white shadow">
                    <h1 className="text-2xl font-bold">Agenda</h1>
                    <Filters />
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-auto p-4">
                        <Calendar />
                    </div>
                    <aside className="w-80 border-l bg-white p-4 overflow-auto">
                        <Sidebar />
                    </aside>
                </div>
            </div>
        </div>
    );
}
