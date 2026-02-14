'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Check, X, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

interface Payment {
    id?: string;
    patientId: string;
    patientName: string;
    appointmentId?: string;
    amount: number;
    method: string;
    status: string;
    date: string;
    description: string;
    paidAt?: string;
}

interface PaymentsListProps {
    patientId: string;
    patientName: string;
}

export function PaymentsList({ patientId, patientName }: PaymentsListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const queryClient = useQueryClient();

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments', patientId],
        queryFn: async () => {
            const res = await api.get('/payments', { params: { patientId } });
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/payments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', patientId] });
        },
    });

    const markAsPaidMutation = useMutation({
        mutationFn: (id: string) => api.put(`/payments/${id}`, { status: 'paid' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', patientId] });
        },
    });

    const handleEdit = (payment: Payment) => {
        setEditingPayment(payment);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Excluir este pagamento?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPayment(null);
    };

    const totalPaid = payments
        .filter((p: Payment) => p.status === 'paid')
        .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);

    const totalPending = payments
        .filter((p: Payment) => p.status === 'pending')
        .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);

    if (isLoading) {
        return <div className="text-center py-8">Carregando...</div>;
    }

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Recebido</p>
                    <p className="text-2xl font-bold text-green-700">
                        R$ {totalPaid.toFixed(2)}
                    </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600">Pendente</p>
                    <p className="text-2xl font-bold text-yellow-700">
                        R$ {totalPending.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Pagamentos</h3>
                <Button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pagamento
                </Button>
            </div>

            {/* List */}
            {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pagamento registrado</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment: Payment) => (
                        <div
                            key={payment.id}
                            className={`p-4 rounded-lg border-l-4 ${payment.status === 'paid'
                                    ? 'bg-green-50 border-green-500'
                                    : payment.status === 'pending'
                                        ? 'bg-yellow-50 border-yellow-500'
                                        : 'bg-red-50 border-red-500'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">R$ {payment.amount?.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(payment.date).toLocaleDateString('pt-BR')} • {
                                            payment.method === 'pix' ? 'PIX' :
                                                payment.method === 'dinheiro' ? 'Dinheiro' :
                                                    payment.method === 'cartao_credito' ? 'Cartão Crédito' :
                                                        payment.method === 'cartao_debito' ? 'Cartão Débito' :
                                                            'Convênio'
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {payment.status === 'pending' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAsPaidMutation.mutate(payment.id!)}
                                            className="text-green-600"
                                            title="Marcar como pago"
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => generateReceipt(payment, patientName)}
                                        title="Gerar recibo"
                                    >
                                        <Receipt className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(payment)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(payment.id!)}
                                        className="text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PaymentModal
                patientId={patientId}
                patientName={patientName}
                open={isModalOpen}
                onClose={handleCloseModal}
                payment={editingPayment}
            />
        </div>
    );
}

function PaymentModal({
    patientId,
    patientName,
    open,
    onClose,
    payment,
}: {
    patientId: string;
    patientName: string;
    open: boolean;
    onClose: () => void;
    payment: Payment | null;
}) {
    const queryClient = useQueryClient();
    const isEditing = !!payment?.id;

    const { register, handleSubmit, reset } = useForm<Payment>({
        defaultValues: {
            amount: payment?.amount || 0,
            method: payment?.method || 'pix',
            status: payment?.status || 'pending',
            date: payment?.date || new Date().toISOString().split('T')[0],
            description: payment?.description || 'Consulta médica',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: Payment) => api.post('/payments', {
            ...data,
            patientId,
            patientName,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', patientId] });
            reset();
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Payment) => api.put(`/payments/${payment?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments', patientId] });
            onClose();
        },
    });

    const onSubmit = (data: Payment) => {
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Pagamento' : 'Novo Pagamento'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Valor (R$)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            {...register('amount', { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label>Método</Label>
                        <select
                            {...register('method')}
                            className="w-full h-10 px-3 rounded-md border"
                        >
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                            <option value="convenio">Convênio</option>
                        </select>
                    </div>

                    <div>
                        <Label>Status</Label>
                        <select
                            {...register('status')}
                            className="w-full h-10 px-3 rounded-md border"
                        >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    <div>
                        <Label>Data</Label>
                        <Input type="date" {...register('date')} />
                    </div>

                    <div>
                        <Label>Descrição</Label>
                        <Input {...register('description')} placeholder="Consulta médica" />
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

// Receipt PDF generator
function generateReceipt(payment: Payment, patientName: string) {
    const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recibo</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0d9488; margin: 0; font-size: 28px; }
        .receipt-number { text-align: right; color: #666; margin-bottom: 20px; }
        .content { margin-bottom: 30px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .amount { font-size: 24px; color: #0d9488; text-align: center; margin: 30px 0; }
        .footer { margin-top: 60px; text-align: center; }
        .signature { margin-top: 60px; border-top: 1px solid #000; width: 250px; margin-left: auto; margin-right: auto; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CALYX</h1>
        <p>Prontuário Eletrônico e Gestão Médica</p>
      </div>
      
      <div class="receipt-number">
        Recibo #${payment.id?.slice(-6).toUpperCase() || '000000'}
      </div>
      
      <h2 style="text-align: center;">RECIBO DE PAGAMENTO</h2>
      
      <div class="content">
        <div class="row">
          <span class="label">Paciente:</span>
          <span class="value">${patientName}</span>
        </div>
        <div class="row">
          <span class="label">Data:</span>
          <span class="value">${new Date(payment.date).toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="row">
          <span class="label">Descrição:</span>
          <span class="value">${payment.description}</span>
        </div>
        <div class="row">
          <span class="label">Forma de Pagamento:</span>
          <span class="value">${payment.method === 'pix' ? 'PIX' :
            payment.method === 'dinheiro' ? 'Dinheiro' :
                payment.method === 'cartao_credito' ? 'Cartão de Crédito' :
                    payment.method === 'cartao_debito' ? 'Cartão de Débito' :
                        'Convênio'
        }</span>
        </div>
      </div>
      
      <div class="amount">
        <p style="margin: 0; color: #666; font-size: 14px;">Valor</p>
        <p style="margin: 5px 0;">R$ ${payment.amount?.toFixed(2)}</p>
      </div>
      
      <div class="footer">
        <p style="color: #666; font-size: 12px;">
          Documento gerado em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
      
      <div class="signature">
        Assinatura
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
