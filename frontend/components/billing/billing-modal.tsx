'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Receipt, CheckCircle2, DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react';

export interface BillingEntry {
  patientId: string;
  patientName: string;
  productName: string;
  category: 'consultation' | 'procedure' | 'exam' | 'medication' | 'material' | 'other';
  unitPrice: number;
  quantity: number;
  source: 'consulta' | 'procedimento' | 'avulsa';
  appointmentId?: string;
  applicationId?: string;
}

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', icon: Smartphone },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'credit', label: 'Crédito', icon: CreditCard },
  { value: 'debit', label: 'Débito', icon: CreditCard },
];

interface BillingModalProps {
  entry: BillingEntry | null;
  onClose: () => void;
  onConfirm: (data: {
    entry: BillingEntry;
    paymentMethod: string;
    discount: number;
    notes: string;
    total: number;
  }) => void;
}

export function BillingModal({ entry, onClose, onConfirm }: BillingModalProps) {
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (!entry) return null;

  const total = (entry.unitPrice * entry.quantity) - discount;

  const handleConfirm = () => {
    onConfirm({
      entry,
      paymentMethod: selectedPayment,
      discount,
      notes: notes || `${entry.source} - ${selectedPayment}`,
      total,
    });
    setSelectedPayment('pix');
    setDiscount(0);
    setNotes('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border w-full max-w-md p-0 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-foreground" />
                Registro de Entrada
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                {entry.source === 'consulta' ? 'Consulta Médica' : entry.source === 'procedimento' ? 'Protocolo Injetável' : 'Entrada Avulsa'}
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
              <User className="w-5 h-5 text-foreground" />
              <div>
                <p className="font-serif font-semibold text-foreground text-sm">{entry.patientName}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{entry.productName}</p>
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Valor Unit.</label>
                <div className="font-mono text-xl font-bold text-foreground">
                  {formatCurrency(entry.unitPrice)}
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border bg-background font-mono text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Total */}
            <div className="p-3 border border-foreground/30 bg-foreground/[0.05]">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Total a cobrar</span>
                <span className="font-serif text-2xl font-bold text-foreground">
                  {formatCurrency(total)}
                </span>
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
                        ? 'border-foreground bg-foreground/10 text-foreground'
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
                className="w-full px-3 py-2 border border-border bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 border-t border-border bg-muted/20">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-border font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 h-10 bg-foreground hover:bg-foreground/90 text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmar Recebimento
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
