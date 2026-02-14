'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface AnamnesisData {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory: string;
    familyHistory: string;
    socialHistory: string;
    currentMedications: string;
    allergies: string;
}

interface AnamnesisFormProps {
    patientId: string;
}

export function AnamnesisForm({ patientId }: AnamnesisFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const { data: anamnesis, isLoading } = useQuery({
        queryKey: ['anamnesis', patientId],
        queryFn: async () => {
            const res = await api.get(`/medical-records/${patientId}/anamnesis`);
            return res.data;
        },
    });

    const { register, handleSubmit, reset } = useForm<AnamnesisData>();

    useEffect(() => {
        if (anamnesis) {
            reset(anamnesis);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [anamnesis, reset]);

    const saveMutation = useMutation({
        mutationFn: (data: AnamnesisData) =>
            api.post(`/medical-records/${patientId}/anamnesis`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anamnesis', patientId] });
            setIsEditing(false);
        },
    });

    const onSubmit = (data: AnamnesisData) => {
        saveMutation.mutate(data);
    };

    if (isLoading) {
        return <div className="text-center py-8">Carregando...</div>;
    }

    const fields = [
        { name: 'chiefComplaint', label: 'Queixa Principal', placeholder: 'Motivo principal da consulta...' },
        { name: 'historyOfPresentIllness', label: 'História da Doença Atual', placeholder: 'Descreva o início e evolução dos sintomas...' },
        { name: 'pastMedicalHistory', label: 'Antecedentes Pessoais', placeholder: 'Doenças prévias, cirurgias, internações...' },
        { name: 'familyHistory', label: 'Antecedentes Familiares', placeholder: 'Doenças na família (pais, irmãos)...' },
        { name: 'socialHistory', label: 'Hábitos de Vida', placeholder: 'Tabagismo, etilismo, atividade física, alimentação...' },
        { name: 'currentMedications', label: 'Medicamentos em Uso', placeholder: 'Lista de medicamentos atuais...' },
        { name: 'allergies', label: 'Alergias', placeholder: 'Alergias conhecidas a medicamentos, alimentos...' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Anamnese</h3>
                {!isEditing && anamnesis && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                )}
            </div>

            {!anamnesis && !isEditing ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma anamnese registrada</p>
                    <Button onClick={() => setIsEditing(true)} className="mt-4 bg-primary hover:bg-teal-700">
                        Registrar Anamnese
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <Label className="text-sm font-medium">{field.label}</Label>
                            {isEditing ? (
                                <textarea
                                    {...register(field.name as keyof AnamnesisData)}
                                    className="w-full mt-1 p-3 border rounded-lg resize-none"
                                    rows={3}
                                    placeholder={field.placeholder}
                                />
                            ) : (
                                <p className="mt-1 p-3 bg-muted/50 rounded-lg min-h-[60px]">
                                    {(anamnesis as any)?.[field.name] || '-'}
                                </p>
                            )}
                        </div>
                    ))}

                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                            {anamnesis && (
                                <Button type="button" variant="outline" onClick={() => {
                                    reset(anamnesis);
                                    setIsEditing(false);
                                }}>
                                    Cancelar
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="bg-primary hover:bg-teal-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saveMutation.isPending ? 'Salvando...' : 'Salvar Anamnese'}
                            </Button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}
