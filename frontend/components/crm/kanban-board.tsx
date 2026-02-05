'use client';

import React, { useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    TouchSensor,
    MouseSensor
} from '@dnd-kit/core';
import { KanbanColumn as KanbanColumnComponent } from './kanban-column';
import { LeadCard } from './lead-card';
import { Lead, LeadStage } from '@/types/crm';
import { useLeads } from '@/hooks/use-leads';

const COLUMNS: { id: LeadStage; title: string; color: string; emoji: string }[] = [
    { id: 'lead_frio', title: 'Lead Frio', color: '#64748B', emoji: '🧊' },
    { id: 'marcacao_consulta', title: 'Marcação de Consulta', color: '#3B82F6', emoji: '📋' },
    { id: 'confirmacao_consulta', title: 'Confirmação Consulta', color: '#F59E0B', emoji: '📅' },
    { id: 'confirmacao_procedimento', title: 'Confirmação Procedimento', color: '#10B981', emoji: '💉' },
    { id: 'duvidas_intercorrencias', title: 'Dúvidas / Intercorrências', color: '#EF4444', emoji: '🆘' },
    { id: 'dr_paulo', title: 'Dr. Paulo', color: '#14B8A6', emoji: '👨‍⚕️' },
];

export function KanbanBoard() {
    const { leads, moveLead, assignLead, isLoading } = useLeads();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const leadId = active.id as string;
        let newStage: LeadStage | null = null;

        // Check if dropped on a column container
        if (COLUMNS.some(col => col.id === over.id)) {
            newStage = over.id as LeadStage;
        } else {
            // Check if dropped on another card
            const overLead = leads.find(l => l.id === over.id);
            if (overLead) {
                newStage = overLead.stage;
            }
        }

        const currentLead = leads.find(l => l.id === leadId);

        if (newStage && currentLead && newStage !== currentLead.stage) {
            moveLead({ id: leadId, stage: newStage });
        }

        setActiveId(null);
    };

    // Handler para atribuir lead a membro da equipe
    const handleAssign = (leadId: string, memberId: string | null) => {
        assignLead({ id: leadId, assignedTo: memberId });
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 w-full h-full">
                <div className="text-slate-500 animate-pulse">Carregando pipeline...</div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full w-full gap-3 overflow-x-auto pb-4 items-start">
                {COLUMNS.map((col) => {
                    const columnLeads = leads.filter(l => l.stage === col.id);

                    return (
                        <KanbanColumnComponent
                            key={col.id}
                            column={{ ...col, leads: columnLeads }}
                            onAssign={handleAssign}
                        />
                    );
                })}
            </div>

            <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} onAssign={handleAssign} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
