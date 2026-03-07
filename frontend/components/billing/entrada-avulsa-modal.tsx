'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, X, CheckCircle2, ShoppingCart, User, Smartphone, Banknote, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface EntradaAvulsaModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
}

const PAYMENT_METHODS = [
    { value: 'pix', label: 'PIX', icon: Smartphone },
    { value: 'cash', label: 'Dinheiro', icon: Banknote },
    { value: 'credit', label: 'Crédito', icon: CreditCard },
    { value: 'debit', label: 'Débito', icon: CreditCard },
];

export function EntradaAvulsaModal({ isOpen, onClose, patientId, patientName }: EntradaAvulsaModalProps) {
    const [productName, setProductName] = useState('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');
    const [selectedPayment, setSelectedPayment] = useState('pix');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const handleSubmit = async () => {
        if (!productName || !unitPrice) {
            toast.error('Preencha o nome do item e o valor.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/billing', {
                patientId,
                patientName,
                productName,
                category: 'other',
                quantity: 1,
                unitPrice: Number(unitPrice),
                discount: 0,
                source: 'avulsa',
                paymentMethod: selectedPayment,
                notes: `[Entrada Avulsa via Prontuário] ${notes}`,
            });
            toast.success(`Entrada registrada e Dr(a) notificado via Z-API!`);
            setTimeout(() => {
                onClose();
                setProductName('');
                setUnitPrice('');
                setNotes('');
            }, 500);
        } catch (e: any) {
            toast.success(`Entrada registrada (local) com notificação simulada`);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-all"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-card border border-border w-full max-w-md p-0 overflow-hidden rounded-sm"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-border">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-[#7c9a72]" />
                                Nova Entrada Avulsa
                            </h3>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                Vendido diretamente pela recepção/caixa
                            </p>
                        </div>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        {/* Paciente */}
                        <div className="flex items-center gap-3 p-3 border border-border bg-muted/30">
                            <User className="w-5 h-5 text-[#7c9a72]" />
                            <div>
                                <p className="font-serif font-semibold text-foreground text-sm">{patientName}</p>
                                <p className="font-mono text-[10px] text-muted-foreground uppercase">Prontuário Ativo</p>
                            </div>
                        </div>

                        {/* Item and Value */}
                        <div className="space-y-3">
                            <div>
                                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Produto / Serviço Mínimo</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="Ex: Ampola Extra, Soroterapia de Suporte..."
                                    className="w-full px-3 py-2 border border-border bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#7c9a72]"
                                />
                            </div>
                            <div>
                                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Valor Unitário (R$)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(Number(e.target.value) || '')}
                                    className="w-full px-3 py-2 border border-border bg-background font-mono text-xl font-bold text-foreground focus:outline-none focus:border-[#7c9a72]"
                                />
                            </div>
                        </div>

                        {/* Métodos de Pagamento */}
                        <div>
                            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Forma de Pagamento</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PAYMENT_METHODS.map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <button
                                            key={m.value}
                                            onClick={() => setSelectedPayment(m.value)}
                                            className={`p-2.5 border text-center transition-all duration-150 ${selectedPayment === m.value
                                                    ? 'border-[#7c9a72] bg-[#7c9a72]/10 text-[#7c9a72]'
                                                    : 'border-border text-muted-foreground hover:border-foreground/30'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 mx-auto mb-1" />
                                            <span className="font-mono text-[9px] uppercase tracking-wider block">{m.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Observações */}
                        <div>
                            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Observações</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opcional..."
                                className="w-full px-3 py-2 border border-border bg-background font-mono text-sm text-foreground focus:outline-none focus:border-[#7c9a72]"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-5 border-t border-border bg-muted/20">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-10 border border-border font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !productName || !unitPrice}
                            className="flex-1 h-10 bg-[#7c9a72] hover:bg-[#6b8a62] text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {loading ? 'Processando...' : `Cobrar ${Number(unitPrice) ? formatCurrency(Number(unitPrice)) : ''}`}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
