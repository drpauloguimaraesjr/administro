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
    { id: 'first_contact', title: 'Primeiro Contato', color: '#3B82F6', emoji: '👋' },
    { id: 'medical_appointment', title: 'Consulta Médica', color: '#8B5CF6', emoji: '🩺' },
    { id: 'appointment_confirmation', title: 'Confirmar Consulta', color: '#F59E0B', emoji: '📅' },
    { id: 'procedure_confirmation', title: 'Confirmar Procedimento', color: '#10B981', emoji: '💉' },
    { id: 'doubts', title: 'Dúvidas', color: '#6366F1', emoji: '🤔' },
    { id: 'complications', title: 'Intercorrências', color: '#EF4444', emoji: '🚑' },
    { id: 'dr_paulo', title: 'Dr. Paulo Guimarães', color: '#14B8A6', emoji: '👨‍⚕️' },
];

export function KanbanBoard() {
    const { leads, moveLead, isLoading } = useLeads();
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
            <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
                {COLUMNS.map((col) => {
                    const columnLeads = leads.filter(l => l.stage === col.id);

                    return (
                        <KanbanColumnComponent
                            key={col.id}
                            column={{ ...col, leads: columnLeads }}
                        />
                    );
                })}
            </div>

            <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
