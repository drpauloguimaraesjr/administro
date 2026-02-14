'use client';

import { FileText, Edit3, Star, Pill, Stethoscope, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data simulating aggregated backend response
const timelineEvents = [
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
    return (
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

                        {/* Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
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
                                <button className="text-[10px] font-bold text-primary hover:underline">Ver Detalhes</button>
                                {evt.type === 'prescription' && (
                                    <button className="text-[10px] font-bold text-primary hover:underline ml-auto">Repetir Receita</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
