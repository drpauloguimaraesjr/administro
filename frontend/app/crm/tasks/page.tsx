'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/crm/task-card';
import { Task } from '@/types/crm';
import { Plus, ListTodo, CalendarCheck, Clock } from 'lucide-react';
import Link from 'next/link';

// Mock Tasks Data
const INITIAL_TASKS: Task[] = [
    {
        id: '1',
        title: 'Ligar para confirmar interesse',
        description: 'Lead demonstrou interesse em emagrecimento, verificar disponibilidade.',
        type: 'call',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Amanhã
        assignedTo: 'Dr. Paulo',
        leadName: 'Maria Silva',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
    },
    {
        id: '2',
        title: 'Enviar tabela de preços',
        description: 'Solicitou via WhatsApp.',
        type: 'whatsapp',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // Depois de amanhã
        assignedTo: 'Ana',
        leadName: 'João Santos',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
    },
    {
        id: '3',
        title: 'Follow-up Lead Frio',
        description: 'Sem contato há 5 dias.',
        type: 'follow_up',
        priority: 'low',
        status: 'pending',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Ontem (Atrasada)
        assignedTo: 'Ana',
        leadName: 'Pedro Alves',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
    },
    {
        id: '4',
        title: 'Reunião de Alinhamento',
        description: 'Reunião semanal da equipe.',
        type: 'meeting',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Passado
        assignedTo: 'Dr. Paulo',
        createdAt: new Date().toISOString(),
        createdBy: 'system'
    }
];

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
        ));
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date());

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="flex-none p-6 pb-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Minhas Tarefas</h1>
                        <p className="text-sm text-slate-500">
                            Gerencie suas atividades diárias e follow-ups.
                        </p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
                    </Button>
                </div>

                {/* Filters/Tabs */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-white dark:bg-slate-900 border mb-4">
                        <TabsTrigger value="all" className="px-6">Todas</TabsTrigger>
                        <TabsTrigger value="today">Hoje</TabsTrigger>
                        <TabsTrigger value="overdue" className="text-red-600 data-[state=active]:text-red-700">
                            Atrasadas ({overdueTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed">Concluídas</TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-12 gap-6 pb-6">
                        {/* Main Task List */}
                        <div className="col-span-8 space-y-4">
                            <TabsContent value="all" className="mt-0 space-y-3">
                                {pendingTasks.map(task => (
                                    <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                                ))}
                                {pendingTasks.length === 0 && <p className="text-slate-500 text-center py-10">Nenhuma tarefa pendente!</p>}
                            </TabsContent>

                            <TabsContent value="overdue" className="mt-0 space-y-3">
                                {overdueTasks.map(task => (
                                    <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                                ))}
                            </TabsContent>

                            <TabsContent value="completed" className="mt-0 space-y-3">
                                {completedTasks.map(task => (
                                    <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                                ))}
                            </TabsContent>
                        </div>

                        {/* Sidebar Summary */}
                        <div className="col-span-4 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Resumo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <ListTodo className="w-5 h-5" />
                                            <span className="font-medium">Pendentes</span>
                                        </div>
                                        <span className="text-xl font-bold">{pendingTasks.length}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5" />
                                            <span className="font-medium">Atrasadas</span>
                                        </div>
                                        <span className="text-xl font-bold">{overdueTasks.length}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CalendarCheck className="w-5 h-5" />
                                            <span className="font-medium">Concluídas</span>
                                        </div>
                                        <span className="text-xl font-bold">{completedTasks.length}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
