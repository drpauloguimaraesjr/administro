'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Settings2, Trash2, Edit, MessageSquare, Users as UsersIcon, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueuesService } from '@/services/queues-service';
import { WhatsAppQueue } from '@/types/user-system';
import { NewQueueDialog } from '@/components/whatsapp/new-queue-dialog';
import { Switch } from '@/components/ui/switch';

export default function QueuesPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<WhatsAppQueue | null>(null);

    const { data: queues = [], isLoading } = useQuery({
        queryKey: ['queues'],
        queryFn: QueuesService.getAll,
    });

    const seedMutation = useMutation({
        mutationFn: QueuesService.seed,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queues'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: QueuesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queues'] });
        }
    });

    const handleEdit = (queue: WhatsAppQueue) => {
        setSelectedQueue(queue);
        setIsDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedQueue(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta fila?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Filas de Atendimento</h1>
                    <p className="text-slate-500">Organize os tipos de atendimento do WhatsApp.</p>
                </div>
                <div className="flex gap-2">
                    {queues.length === 0 && (
                        <Button variant="outline" onClick={() => seedMutation.mutate()}>
                            <Wand2 className="w-4 h-4 mr-2" /> Gerar Padrões
                        </Button>
                    )}
                    <Button onClick={handleNew} className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="w-4 h-4 mr-2" /> Nova Fila
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <p>Carregando...</p>
                ) : queues.map((queue) => (
                    <Card key={queue.id} className="hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: queue.color }}></div>
                        <CardHeader className="pl-6 pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{queue.icon}</span>
                                    <div>
                                        <CardTitle className="text-lg">{queue.name}</CardTitle>
                                        <CardDescription>{queue.description}</CardDescription>
                                    </div>
                                </div>
                                <Switch checked={queue.isActive} />
                            </div>
                        </CardHeader>
                        <CardContent className="pl-6 pt-2 space-y-4">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <UsersIcon className="w-4 h-4" />
                                    <span>{queue.assignedUsers?.length || 0} Atendentes</span>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                    {queue.assignmentType === 'ai' ? '🤖 IA Gerencia' : queue.assignmentType.replace('_', ' ')}
                                </Badge>
                            </div>

                            {queue.aiConfig?.enabled && (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                    <Wand2 className="w-3 h-3 mr-1" /> IA Ativa
                                </Badge>
                            )}

                            <div className="flex justify-end gap-2 pt-2 border-t mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(queue)}>
                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(queue.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <NewQueueDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                queueToEdit={selectedQueue}
            />
        </div>
    );
}
