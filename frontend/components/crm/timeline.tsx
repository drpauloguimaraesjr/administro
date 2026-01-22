'use client';

import React from 'react';
import {
    MessageCircle,
    Phone,
    Mail,
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Interaction } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineProps {
    interactions: Interaction[];
}

const interactionIcons = {
    whatsapp: <MessageCircle className="w-4 h-4" />,
    call: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    note: <FileText className="w-4 h-4" />,
};

const interactionColors = {
    whatsapp: 'bg-green-100 text-green-700 border-green-200',
    call: 'bg-blue-100 text-blue-700 border-blue-200',
    email: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    meeting: 'bg-purple-100 text-purple-700 border-purple-200',
    note: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function Timeline({ interactions }: TimelineProps) {
    return (
        <div className="space-y-6 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />

            {interactions.map((interaction) => (
                <div key={interaction.id} className="relative pl-10 group">
                    {/* Icon Marker */}
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm z-10 ${interactionColors[interaction.type]}`}>
                        {interactionIcons[interaction.type]}
                    </div>

                    <Card className="border-l-4 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-700 transition-all">
                        <CardContent className="p-4 pt-3">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                                        {interaction.type === 'whatsapp' ? 'Mensagem WhatsApp' :
                                            interaction.type === 'call' ? 'Ligação' :
                                                interaction.type === 'note' ? 'Nota Interna' : interaction.type}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {formatDistanceToNow(new Date(interaction.createdAt), { locale: ptBR, addSuffix: true })}
                                        {' • '}
                                        {interaction.createdBy}
                                    </span>
                                </div>

                                {interaction.outcome && (
                                    <Badge variant="outline" className="text-[10px] h-5">
                                        {interaction.outcome}
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                {interaction.content}
                            </div>

                            {/* Actions visible on hover (simulated) */}
                            <div className="mt-2 pt-2 border-t flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400">Editar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}

            {/* Create New Interaction Stub */}
            <div className="relative pl-10 pt-4">
                <div className="absolute left-0 top-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 text-slate-400">
                    <MoreVertical className="w-4 h-4" />
                </div>
                <Button variant="outline" className="w-full justify-start text-slate-500 h-12 border-dashed">
                    Clique para adicionar uma nota, chamada ou tarefa...
                </Button>
            </div>
        </div>
    );
}
