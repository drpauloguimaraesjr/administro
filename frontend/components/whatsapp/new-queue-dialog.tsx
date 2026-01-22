'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueuesService } from '@/services/queues-service';
import { WhatsAppQueue } from '@/types/user-system';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const queueSchema = z.object({
    name: z.string().min(2, 'Nome muito curto'),
    description: z.string(),
    icon: z.string(),
    color: z.string(),
    priority: z.coerce.number().min(1).max(5),
    assignmentType: z.enum(['manual', 'round_robin', 'least_busy', 'ai']),

    // Auto Reply
    autoReplyEnabled: z.boolean(),
    autoReplyMessage: z.string().optional(),

    // IA
    aiEnabled: z.boolean(),
    aiPrompt: z.string().optional(),
});

type QueueFormData = z.infer<typeof queueSchema>;

interface NewQueueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    queueToEdit?: WhatsAppQueue | null;
}

export function NewQueueDialog({ open, onOpenChange, queueToEdit }: NewQueueDialogProps) {
    const queryClient = useQueryClient();
    const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<QueueFormData>({
        resolver: zodResolver(queueSchema),
        defaultValues: {
            priority: 3,
            assignmentType: 'manual',
            icon: '📁',
            color: '#3B82F6',
            autoReplyEnabled: false,
            aiEnabled: false
        }
    });

    const assignmentType = watch('assignmentType');
    const aiEnabled = watch('aiEnabled');
    const autoReplyEnabled = watch('autoReplyEnabled');

    useEffect(() => {
        if (queueToEdit) {
            reset({
                name: queueToEdit.name,
                description: queueToEdit.description,
                icon: queueToEdit.icon,
                color: queueToEdit.color,
                priority: queueToEdit.priority,
                assignmentType: queueToEdit.assignmentType,
                autoReplyEnabled: queueToEdit.autoReply?.enabled || false,
                autoReplyMessage: queueToEdit.autoReply?.message || '',
                aiEnabled: queueToEdit.aiConfig?.enabled || false,
                aiPrompt: queueToEdit.aiConfig?.systemPrompt || '',
            });
        } else {
            reset({
                priority: 3,
                assignmentType: 'manual',
                icon: '📁',
                color: '#3B82F6',
                autoReplyEnabled: false,
                aiEnabled: false
            })
        }
    }, [queueToEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: QueueFormData) => {
            const payload: any = {
                ...data,
                autoReply: {
                    enabled: data.autoReplyEnabled,
                    message: data.autoReplyMessage || '',
                    delay: 3
                },
                aiConfig: {
                    enabled: data.aiEnabled,
                    systemPrompt: data.aiPrompt || '',
                    model: 'gpt-4-turbo',
                    autoGenerate: true,
                    requireApproval: true
                }
            };

            if (queueToEdit) {
                return QueuesService.update(queueToEdit.id, payload);
            } else {
                return QueuesService.create(payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queues'] });
            onOpenChange(false);
            reset();
        }
    });

    const onSubmit = (data: QueueFormData) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{queueToEdit ? 'Editar Fila' : 'Nova Fila'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="info">Informações</TabsTrigger>
                            <TabsTrigger value="automation">Automação</TabsTrigger>
                            <TabsTrigger value="ai">IA Intelligence</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome da Fila *</Label>
                                <Input id="name" {...register('name')} placeholder="Ex: Financeiro" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label>Descrição</Label>
                                <Input {...register('description')} placeholder="Para que serve esta fila?" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Ícone (Emoji)</Label>
                                    <Input {...register('icon')} placeholder="📁" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Cor Hex</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" {...register('color')} className="w-12 p-1 h-10" />
                                        <Input {...register('color')} placeholder="#000000" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Atribuição de Chamados</Label>
                                <Controller
                                    name="assignmentType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual (Admin define)</SelectItem>
                                                <SelectItem value="round_robin">Round Robin (Revezamento)</SelectItem>
                                                <SelectItem value="least_busy">Menos Ocupado</SelectItem>
                                                <SelectItem value="ai">Inteligência Artificial (IA)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="automation" className="space-y-4 py-4">
                            <div className="flex items-center justify-between border p-4 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Resposta Automática</Label>
                                    <p className="text-sm text-slate-500">Enviar mensagem ao entrar na fila</p>
                                </div>
                                <Controller
                                    name="autoReplyEnabled"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>

                            {autoReplyEnabled && (
                                <div className="grid gap-2">
                                    <Label>Mensagem de Boas-vindas</Label>
                                    <Textarea
                                        {...register('autoReplyMessage')}
                                        placeholder="Olá! Em instantes você será atendido..."
                                        className="h-24"
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="ai" className="space-y-4 py-4">
                            <div className="flex items-center justify-between border p-4 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Habilitar IA (GPT-4)</Label>
                                    <p className="text-sm text-slate-500">Permitir que a IA analise e sugira respostas</p>
                                </div>
                                <Controller
                                    name="aiEnabled"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>

                            {aiEnabled && (
                                <div className="grid gap-2">
                                    <Label>Prompt do Sistema (Instruções)</Label>
                                    <Textarea
                                        {...register('aiPrompt')}
                                        placeholder="Você é um assistente útil..."
                                        className="h-40 font-mono text-sm"
                                    />
                                    <p className="text-xs text-slate-500">Defina a personalidade e regras da IA para esta fila.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancelar</Button>
                        <Button type="submit" disabled={mutation.isLoading}>
                            {mutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Fila
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
