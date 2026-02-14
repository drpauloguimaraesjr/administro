'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, FileText, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface Prescription {
    id?: string;
    date: string;
    medications: Medication[];
    notes?: string;
}

interface PrescriptionsListProps {
    patientId: string;
    patientName: string;
}

export function PrescriptionsList({ patientId, patientName }: PrescriptionsListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: prescriptions = [], isLoading } = useQuery({
        queryKey: ['prescriptions', patientId],
        queryFn: async () => {
            const res = await api.get(`/medical-records/${patientId}/prescriptions`);
            return res.data;
        },
    });

    if (isLoading) {
        return <div className="text-center py-8">Carregando...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Prescrições</h3>
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Prescrição
                </Button>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma prescrição registrada</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((prescription: Prescription) => (
                        <div
                            key={prescription.id}
                            className="bg-muted/50 rounded-lg p-4"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-medium">
                                        Prescrição de {new Date(prescription.date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {prescription.medications.length} medicamento(s)
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => generatePDF(prescription, patientName)}
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {prescription.medications.map((med, idx) => (
                                    <div key={idx} className="text-sm p-2 bg-white rounded">
                                        <p className="font-medium">{med.name} - {med.dosage}</p>
                                        <p className="text-muted-foreground">
                                            {med.frequency} por {med.duration}
                                        </p>
                                        {med.instructions && (
                                            <p className="text-xs italic">{med.instructions}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PrescriptionModal
                patientId={patientId}
                patientName={patientName}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

function PrescriptionModal({
    patientId,
    patientName,
    open,
    onClose,
}: {
    patientId: string;
    patientName: string;
    open: boolean;
    onClose: () => void;
}) {
    const queryClient = useQueryClient();

    const { register, control, handleSubmit, reset } = useForm<Prescription>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
            notes: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'medications',
    });

    const createMutation = useMutation({
        mutationFn: (data: Prescription) =>
            api.post(`/medical-records/${patientId}/prescriptions`, data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
            generatePDF(data, patientName);
            reset();
            onClose();
        },
    });

    const onSubmit = (data: Prescription) => {
        createMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Prescrição</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Data</Label>
                        <Input type="date" {...register('date')} />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Medicamentos</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg relative">
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Label className="text-xs">Medicamento</Label>
                                            <Input
                                                {...register(`medications.${index}.name`)}
                                                placeholder="Nome do medicamento"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Dosagem</Label>
                                            <Input
                                                {...register(`medications.${index}.dosage`)}
                                                placeholder="Ex: 500mg"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Frequência</Label>
                                            <Input
                                                {...register(`medications.${index}.frequency`)}
                                                placeholder="Ex: 8/8h"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Duração</Label>
                                            <Input
                                                {...register(`medications.${index}.duration`)}
                                                placeholder="Ex: 7 dias"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Instruções</Label>
                                            <Input
                                                {...register(`medications.${index}.instructions`)}
                                                placeholder="Ex: Após refeições"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label>Observações Gerais</Label>
                        <textarea
                            {...register('notes')}
                            className="w-full p-3 border rounded-lg resize-none"
                            rows={2}
                            placeholder="Orientações adicionais..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-primary hover:bg-teal-700"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            {createMutation.isPending ? 'Gerando...' : 'Gerar Prescrição'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Simple PDF generator using browser print
function generatePDF(prescription: Prescription, patientName: string) {
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prescrição Médica</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0d9488; margin: 0; }
        .patient { margin-bottom: 30px; }
        .medications { margin-bottom: 30px; }
        .medication { padding: 15px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 8px; }
        .medication-name { font-weight: bold; font-size: 16px; }
        .medication-details { color: #666; margin-top: 5px; }
        .footer { margin-top: 50px; text-align: center; }
        .signature { margin-top: 80px; border-top: 1px solid #000; width: 250px; margin-left: auto; margin-right: auto; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CALYX</h1>
        <p>Prontuário Eletrônico e Gestão Médica</p>
      </div>
      
      <div class="patient">
        <h2>Prescrição Médica</h2>
        <p><strong>Paciente:</strong> ${patientName}</p>
        <p><strong>Data:</strong> ${new Date(prescription.date).toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="medications">
        <h3>Medicamentos:</h3>
        ${prescription.medications.map((med, i) => `
          <div class="medication">
            <div class="medication-name">${i + 1}. ${med.name} - ${med.dosage}</div>
            <div class="medication-details">
              Tomar ${med.frequency} durante ${med.duration}
              ${med.instructions ? `<br><em>${med.instructions}</em>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      
      ${prescription.notes ? `<div><strong>Observações:</strong> ${prescription.notes}</div>` : ''}
      
      <div class="signature">
        Assinatura do Médico
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    }
}
