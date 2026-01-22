'use client';

import React, { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    Clock,
    Calendar as CalendarIcon,
    MessageCircle,
    Phone,
    Mail
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/crm';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // Assuming shadcn utils exist

interface TaskCardProps {
    task: Task;
    onToggle: (id: string) => void;
}

const typeIcons = {
    whatsapp: <MessageCircle className="w-3 h-3" />,
    call: <Phone className="w-3 h-3" />,
    email: <Mail className="w-3 h-3" />,
    meeting: <CalendarIcon className="w-3 h-3" />,
    follow_up: <Clock className="w-3 h-3" />,
    other: <Circle className="w-3 h-3" />,
};

const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, onToggle }: TaskCardProps) {
    const isExpired = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed';

    return (
        <Card className={cn(
            "transition-all hover:shadow-sm",
            task.status === 'completed' && "opacity-60 bg-slate-50",
            isExpired && "border-l-4 border-l-red-500"
        )}>
            <CardContent className="p-4 flex items-start gap-3">
                <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => onToggle(task.id)}
                    className="mt-1"
                />

                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                        <h4 className={cn(
                            "font-medium text-sm leading-none",
                            task.status === 'completed' && "line-through text-slate-500"
                        )}>
                            {task.title}
                        </h4>
                        <Badge variant="secondary" className={cn("ml-2 text-[10px] h-5 px-1.5", priorityColors[task.priority])}>
                            {task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                        </Badge>
                    </div>

                    <p className="text-xs text-slate-500">
                        {task.description || (task.leadName ? `Relacionado a ${task.leadName}` : 'Sem descrição')}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {typeIcons[task.type]}
                            <span className="capitalize">{task.type.replace('_', ' ')}</span>
                        </div>

                        <div className={cn(
                            "flex items-center gap-1 text-xs",
                            isExpired ? "text-red-600 font-medium" : "text-slate-400"
                        )}>
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                                {formatDistanceToNow(new Date(task.dueDate), { locale: ptBR, addSuffix: true })}
                            </span>
                        </div>

                        {task.assignedTo && (
                            <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                                <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                                    {task.assignedTo.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
