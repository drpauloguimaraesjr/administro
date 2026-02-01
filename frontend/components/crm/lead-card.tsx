'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    MessageCircle,
    Phone,
    Eye,
    Calendar,
    DollarSign,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { Lead } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AssigneeDropdown, AssigneeBadge } from './assignee-dropdown';

interface LeadCardProps {
    lead: Lead;
    onAssign?: (leadId: string, memberId: string | null) => void;
}

const urgencyColors = {
    low: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    high: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const sourceIcons = {
    whatsapp: <MessageCircle className="w-3 h-3" />,
    instagram: <span className="text-[10px]">IG</span>,
    facebook: <span className="text-[10px]">FB</span>,
    google: <span className="text-[10px]">G</span>,
    website: <span className="text-[10px]">🌐</span>,
    indication: <span className="text-[10px]">🤝</span>,
    phone: <Phone className="w-3 h-3" />,
    other: <span className="text-[10px]">...</span>,
};

export function LeadCard({ lead, onAssign }: LeadCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: { lead },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const handleAssign = (memberId: string | null) => {
        if (onAssign) {
            onAssign(lead.id, memberId);
        }
    };


    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "w-full mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white dark:bg-slate-950",
                isDragging && "opacity-50 ring-2 ring-primary rotate-2 z-50 shadow-xl"
            )}
        >
            <CardHeader className="p-3 pb-0 space-y-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-5 font-normal border-0",
                        lead.urgency ? urgencyColors[lead.urgency] : urgencyColors.low
                    )}>
                        {lead.urgency ? lead.urgency.toUpperCase() : 'NORMAL'}
                    </Badge>
                    {lead.score && (
                        <span className="text-[10px] font-bold text-slate-400">
                            {lead.score} pts
                        </span>
                    )}
                </div>
                <h3 className="font-semibold text-sm leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
                    {lead.name}
                </h3>
            </CardHeader>

            <CardContent className="p-3 py-2 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {sourceIcons[lead.source]}
                        <span className="capitalize">{lead.source}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400" title="Último contato">
                    <Clock className="w-3 h-3" />
                    <span>
                        {lead.lastContactAt
                            ? formatDistanceToNow(new Date(lead.lastContactAt), { locale: ptBR, addSuffix: true })
                            : 'Sem contato'}
                    </span>
                </div>

                {lead.tags && lead.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {lead.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-50 dark:bg-slate-900 border px-1 rounded text-slate-500">
                                {tag}
                            </span>
                        ))}
                        {lead.tags.length > 3 && <span className="text-[10px] text-slate-400">+{lead.tags.length - 3}</span>}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-2 pt-0 flex justify-between items-center border-t mt-2 pt-2 gap-1">
                {/* Dropdown de Atribuição */}
                <div onPointerDown={(e) => e.stopPropagation()}>
                    <AssigneeDropdown
                        value={lead.assignedTo}
                        onChange={handleAssign}
                        compact
                    />
                </div>

                {/* Ações */}
                <div className="flex items-center gap-0.5 ml-auto">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-green-600 hover:bg-green-50">
                        <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Phone className="w-4 h-4" />
                    </Button>
                    <Link href={`/crm/leads/${lead.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-purple-600 hover:bg-purple-50">
                            <Eye className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
