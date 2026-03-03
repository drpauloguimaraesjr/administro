'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    type: 'appointment' | 'application';
    status?: string;
    details?: string;
    icon?: string;
}

interface TimelineProps {
    events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [sortedEvents, setSortedEvents] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setSortedEvents(sorted);
    }, [events]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
    };

    const getIcon = (event: TimelineEvent) => {
        if (event.icon) return event.icon;
        switch (event.type) {
            case 'appointment': return '📅';
            case 'application': return '💉';
            default: return '📍';
        }
    };

    return (
        <div className="relative w-full py-8 overflow-hidden group">
            {/* Scroll indicators hint */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div
                ref={scrollRef}
                className="flex overflow-x-auto pb-12 pt-6 px-4 gap-0 no-scrollbar cursor-grab active:cursor-grabbing"
                style={{ scrollSnapType: 'x proximity' }}
            >
                {sortedEvents.map((event, index) => (
                    <div
                        key={event.id}
                        className="relative flex flex-col items-center min-w-[160px] md:min-w-[200px]"
                        style={{ scrollSnapAlign: 'center' }}
                    >
                        {/* Connecting Line */}
                        {index < sortedEvents.length - 1 && (
                            <div className="absolute top-[41px] left-[50%] w-full h-[3px] bg-gradient-to-r from-blue-400/30 to-blue-200/20" />
                        )}

                        {/* Date Label */}
                        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {formatDate(event.date)}
                        </div>

                        {/* Event Bubble */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative z-20 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ring-4 ring-white transition-all
                                ${event.type === 'appointment'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20 text-white'
                                    : 'bg-white border border-blue-50/50 shadow-slate-200/50'
                                }
                            `}
                        >
                            {getIcon(event)}
                        </motion.div>

                        {/* Event Title */}
                        <div className="mt-4 px-2 text-center max-w-[140px]">
                            <p className={`text-sm font-semibold truncate ${event.type === 'appointment' ? 'text-blue-700' : 'text-slate-800'}`}>
                                {event.title}
                            </p>
                            {event.details && (
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight uppercase font-medium">
                                    {event.details}
                                </p>
                            )}
                        </div>

                        {/* Status/Label if applicable */}
                        {event.status === 'administered' && (
                            <div className="mt-2 text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100">
                                Realizado
                            </div>
                        )}
                        {event.type === 'appointment' && (
                            <div className="mt-2 text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                Consulta
                            </div>
                        )}
                    </div>
                ))}

                {sortedEvents.length === 0 && (
                    <div className="w-full flex items-center justify-center text-slate-400 text-sm italic py-10">
                        Nenhum evento registrado na sua jornada...
                    </div>
                )}
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
