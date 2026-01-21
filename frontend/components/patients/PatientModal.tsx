'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Patient {
    id?: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
    phone: string;
    email?: string;
    notes?: string;
}

interface PatientModalProps {
    open: boolean;
    onClose: () => void;
    patient?: Patient | null;
}

export function PatientModal({ open, onClose, patient }: PatientModalProps) {
    const queryClient = useQueryClient();
    const isEditing = !!patient?.id;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<Patient>({
        defaultValues: {
            name: '',
            cpf: '',
            birthDate: '',
            gender: 'M',
            phone: '',
            email: '',
            notes: '',
        },
    });

    useEffect(() => {
        if (patient) {
            reset({
                name: patient.name || '',
                cpf: patient.cpf || '',
                birthDate: patient.birthDate || '',
                gender: patient.gender || 'M',
                phone: patient.phone || '',
                email: patient.email || '',
                notes: (patient as any).notes || '',
            });
        } else {
            reset({
                name: '',
                cpf: '',
                birthDate: '',
                gender: 'M',
                phone: '',
                email: '',
                notes: '',
            });
        }
    }, [patient, reset]);

    const createMutation = useMutation({
        mutationFn: (data: Patient) => api.post('/patients', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Patient) => api.put(`/patients/${patient?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            onClose();
        },
    });

    const onSubmit = (data: Patient) => {
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Nome */}
                        <div>
                            <Label htmlFor="name">Nome Completo *</Label>
                            <Input
                                id="name"
                                {...register('name', { required: 'Nome é obrigatório' })}
                                placeholder="Nome do paciente"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* CPF e Nascimento */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="cpf">CPF</Label>
                                <Input
                                    id="cpf"
                                    {...register('cpf')}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="birthDate">Data de Nascimento</Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    {...register('birthDate')}
                                />
                            </div>
                        </div>

                        {/* Gênero */}
                        <div>
                            <Label htmlFor="gender">Gênero</Label>
                            <select
                                id="gender"
                                {...register('gender')}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            >
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        {/* Telefone e Email */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="phone">Telefone *</Label>
                                <Input
                                    id="phone"
                                    {...register('phone', { required: 'Telefone é obrigatório' })}
                                    placeholder="(00) 00000-0000"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                        </div>

                        {/* Observações */}
                        <div>
                            <Label htmlFor="notes">Observações</Label>
                            <textarea
                                id="notes"
                                {...register('notes')}
                                className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background resize-none"
                                placeholder="Informações adicionais..."
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
