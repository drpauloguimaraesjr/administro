'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanColumn as IKanbanColumn } from '@/types/crm';
import { LeadCard } from './lead-card';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
    column: IKanbanColumn;
    onAssign?: (leadId: string, memberId: string | null) => void;
}

export function KanbanColumn({ column, onAssign }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const totalValue = column.leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    return (
        <div className="flex flex-col h-full flex-1 min-w-[200px] max-w-[350px] rounded-lg bg-muted/50/50 border border-border">
            {/* Column Header */}
            <div className={cn("p-3 border-b-2", `border-[${column.color}]`)} style={{ borderColor: column.color }}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground/80 uppercase tracking-wide">
                            {column.title}
                        </span>
                        <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                            {column.leads.length}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground/70" />
                    </Button>
                </div>

                {totalValue > 0 && (
                    <div className="text-xs text-muted-foreground font-medium ml-1">
                        R$ {totalValue.toLocaleString('pt-BR')}
                    </div>
                )}
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-2 overflow-y-auto scrollbar-thin transition-colors",
                    isOver ? "bg-muted/80" : ""
                )}
            >
                {column.leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onAssign={onAssign} />
                ))}

                {column.leads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground/70 text-xs text-center p-4">
                        Arraste leads para cá
                    </div>
                )}
            </div>

            {/* Footer / Add Action (Optional) */}
            <div className="p-2 border-t">
                <Button variant="ghost" className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8">
                    <Plus className="w-3 h-3 mr-2" /> Novo Lead
                </Button>
            </div>
        </div>
    );
}
