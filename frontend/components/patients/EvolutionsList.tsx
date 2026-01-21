'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface Evolution {
    id?: string;
    date: string;
    complaint: string;
    physicalExam: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
}

interface EvolutionsListProps {
    patientId: string;
}

export function EvolutionsList({ patientId }: EvolutionsListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvolution, setEditingEvolution] = useState<Evolution | null>(null);
    const queryClient = useQueryClient();

    const { data: evolutions = [], isLoading } = useQuery({
        queryKey: ['evolutions', patientId],
        queryFn: async () => {
            const res = await api.get(`/medical-records/${patientId}/evolutions`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            api.delete(`/medical-records/${patientId}/evolutions/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evolutions', patientId] });
        },
    });

    const handleEdit = (evolution: Evolution) => {
        setEditingEvolution(evolution);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Deseja excluir esta evolução?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvolution(null);
    };

    if (isLoading) {
        return <div className="text-center py-8">Carregando...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Evoluções</h3>
                <Button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Evolução
                </Button>
            </div>

            {evolutions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma evolução registrada</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {evolutions.map((evolution: Evolution) => (
                        <div
                            key={evolution.id}
                            className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-l-4 border-teal-600"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(evolution.date).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(evolution)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(evolution.id!)}
                                        className="text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-muted-foreground">Queixa</p>
                                    <p>{evolution.complaint || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Diagnóstico</p>
                                    <p>{evolution.diagnosis || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Exame Físico</p>
                                    <p>{evolution.physicalExam || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Conduta</p>
                                    <p>{evolution.treatment || '-'}</p>
                                </div>
                            </div>

                            {evolution.notes && (
                                <div className="mt-3 pt-3 border-t text-sm">
                                    <p className="font-medium text-muted-foreground">Observações</p>
                                    <p>{evolution.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <EvolutionModal
                patientId={patientId}
                open={isModalOpen}
                onClose={handleCloseModal}
                evolution={editingEvolution}
            />
        </div>
    );
}

function EvolutionModal({
    patientId,
    open,
    onClose,
    evolution,
}: {
    patientId: string;
    open: boolean;
    onClose: () => void;
    evolution: Evolution | null;
}) {
    const queryClient = useQueryClient();
    const isEditing = !!evolution?.id;

    const { register, handleSubmit, reset } = useForm<Evolution>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            complaint: '',
            physicalExam: '',
            diagnosis: '',
            treatment: '',
            notes: '',
        },
    });

    useState(() => {
        if (evolution) {
            reset(evolution);
        } else {
            reset({
                date: new Date().toISOString().split('T')[0],
                complaint: '',
                physicalExam: '',
                diagnosis: '',
                treatment: '',
                notes: '',
            });
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: Evolution) =>
            api.post(`/medical-records/${patientId}/evolutions`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evolutions', patientId] });
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Evolution) =>
            api.put(`/medical-records/${patientId}/evolutions/${evolution?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['evolutions', patientId] });
            onClose();
        },
    });

    const onSubmit = (data: Evolution) => {
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Evolução' : 'Nova Evolução'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Data do Atendimento</Label>
                        <Input type="date" {...register('date')} />
                    </div>

                    <div>
                        <Label>Queixa / Motivo</Label>
                        <textarea
                            {...register('complaint')}
                            className="w-full p-3 border rounded-lg resize-none dark:bg-slate-700"
                            rows={2}
                            placeholder="Motivo da consulta..."
                        />
                    </div>

                    <div>
                        <Label>Exame Físico</Label>
                        <textarea
                            {...register('physicalExam')}
                            className="w-full p-3 border rounded-lg resize-none dark:bg-slate-700"
                            rows={3}
                            placeholder="Achados do exame físico..."
                        />
                    </div>

                    <div>
                        <Label>Hipótese Diagnóstica</Label>
                        <textarea
                            {...register('diagnosis')}
                            className="w-full p-3 border rounded-lg resize-none dark:bg-slate-700"
                            rows={2}
                            placeholder="Diagnóstico..."
                        />
                    </div>

                    <div>
                        <Label>Conduta / Tratamento</Label>
                        <textarea
                            {...register('treatment')}
                            className="w-full p-3 border rounded-lg resize-none dark:bg-slate-700"
                            rows={3}
                            placeholder="Prescrição, orientações..."
                        />
                    </div>

                    <div>
                        <Label>Observações</Label>
                        <textarea
                            {...register('notes')}
                            className="w-full p-3 border rounded-lg resize-none dark:bg-slate-700"
                            rows={2}
                            placeholder="Observações adicionais..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
