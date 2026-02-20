'use client';

import { useState } from 'react';
import { Edit3, Star, Pill, Paperclip, X, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
    id: string;
    date: string;
    user: string;
    type: string;
    title: string;
    summary: string;
    content: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

// Mock data simulating aggregated backend response
const timelineEvents: TimelineEvent[] = [
    {
        id: '1',
        date: '22/01/2026 10:25',
        user: 'DR. PAULO',
        type: 'prescription',
        title: 'Prescrição Médica',
        summary: '2 Medicamentos: Dipirona, Loratadina',
        content: '1. Dipirona 500mg - 1cp 6/6h se dor\n2. Loratadina 10mg - 1cp dia por 5 dias',
        icon: Pill,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
    },
    {
        id: '2',
        date: '22/01/2026 09:27',
        user: 'DR. PAULO',
        type: 'evolution',
        title: 'Evolução Clínica',
        summary: 'Queixa: Dor de cabeça frontal',
        content: 'Paciente refere cefaleia tensional há 3 dias. Nega náuseas. PA 120/80.',
        icon: Edit3,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
    },
    {
        id: '3',
        date: '15/01/2026 14:00',
        user: 'RECEPÇÃO',
        type: 'attachment',
        title: 'Exame Complementar',
        summary: 'Hemograma Completo.pdf',
        content: '',
        icon: Paperclip,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    }
];

export function Timeline() {
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    return (
        <>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Linha do Tempo</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Recentes</span>
                </div>

                <div className="space-y-6">
                    {timelineEvents.map((evt) => (
                        <div key={evt.id} className="relative pl-6 border-l border-gray-200 ml-2 group">
                            {/* Dot */}
                            <div className={cn(
                                "absolute -left-[9px] top-0 border-2 rounded-full w-4 h-4 flex items-center justify-center transition-colors bg-white",
                                evt.type === 'prescription' ? "border-blue-400" :
                                    evt.type === 'evolution' ? "border-teal-400" : "border-gray-300"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full transition-colors",
                                    evt.type === 'prescription' ? "bg-blue-400" :
                                        evt.type === 'evolution' ? "bg-teal-400" : "bg-gray-300"
                                )}></div>
                            </div>

                            {/* Metadata */}
                            <div className="mb-1 flex items-center gap-2 text-[10px] text-gray-400 uppercase font-semibold tracking-wide">
                                <span className="text-gray-600">{evt.date}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{evt.user}</span>
                            </div>

                            {/* Card — clickable */}
                            <div
                                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => setSelectedEvent(evt)}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={cn("p-1.5 rounded-md", evt.bgColor, evt.color)}>
                                        <evt.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800 leading-none">{evt.title}</h4>
                                        {evt.summary && <p className="text-xs text-gray-500 mt-0.5 font-medium">{evt.summary}</p>}
                                    </div>
                                    <Star className="w-3 h-3 text-gray-200 group-hover:text-yellow-400 ml-auto transition-colors" />
                                </div>

                                {evt.content && (
                                    <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-2 rounded-md border border-gray-100 font-mono">
                                        {evt.content}
                                    </div>
                                )}

                                {/* Quick Actions (Hover) */}
                                <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="text-[10px] font-bold text-primary hover:underline"
                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                                    >
                                        Ver Detalhes
                                    </button>
                                    {evt.type === 'prescription' && (
                                        <button className="text-[10px] font-bold text-primary hover:underline ml-auto">Repetir Receita</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Dialog — 60% of viewport */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
                <DialogContent className="max-w-none w-[60vw] max-h-[85vh] overflow-hidden flex flex-col p-0">
                    {selectedEvent && (
                        <>
                            {/* Header */}
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
                                <div className={cn("p-2 rounded-lg", selectedEvent.bgColor, selectedEvent.color)}>
                                    <selectedEvent.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-bold text-gray-900">
                                            {selectedEvent.title}
                                        </DialogTitle>
                                    </DialogHeader>
                                    {selectedEvent.summary && (
                                        <p className="text-sm text-gray-500 mt-0.5">{selectedEvent.summary}</p>
                                    )}
                                </div>
                            </div>

                            {/* Metadata bar */}
                            <div className="flex items-center gap-4 px-6 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 shrink-0">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {selectedEvent.date}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    {selectedEvent.user}
                                </span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                                    selectedEvent.type === 'prescription' ? "bg-blue-100 text-blue-700" :
                                        selectedEvent.type === 'evolution' ? "bg-teal-100 text-teal-700" :
                                            "bg-orange-100 text-orange-700"
                                )}>
                                    {selectedEvent.type === 'prescription' ? 'Prescrição' :
                                        selectedEvent.type === 'evolution' ? 'Evolução' : 'Anexo'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {selectedEvent.content ? (
                                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        {selectedEvent.content}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <p className="text-sm">Sem conteúdo detalhado disponível</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100 shrink-0 bg-white">
                                {selectedEvent.type === 'prescription' && (
                                    <Button variant="outline" size="sm">
                                        Repetir Receita
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                                    Fechar
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
