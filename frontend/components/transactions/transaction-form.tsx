'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, TransactionType, TransactionStatus } from '@/shared/types/index';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/components/auth/auth-provider';

interface TransactionFormProps {
  onClose: () => void;
  initialData?: Partial<Transaction>;
}

const categories = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Serviços',
  'Moradia',
  'Educação',
  'Lazer',
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros',
];

export function TransactionForm({ onClose, initialData }: TransactionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: initialData?.amount || 0,
    type: (initialData?.type || 'expense') as TransactionType,
    status: (initialData?.status || 'paid') as TransactionStatus,
    date: initialData?.date
      ? (initialData.date instanceof Date ? initialData.date.toISOString().split('T')[0] : initialData.date.toString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    category: initialData?.category || 'Outros',
    contextId: (initialData?.contextId || 'HOME') as 'HOME' | 'CLINIC',
    attachmentUrl: initialData?.attachmentUrl || '',
    supplier: initialData?.supplier || '',
    invoiceNumber: initialData?.invoiceNumber || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      alert('Firebase não está configurado');
      return;
    }

    setLoading(true);
    try {
      if (initialData?.id) {
        // Editar transação existente
        await updateDoc(doc(db, 'transactions', initialData.id), {
          ...formData,
          date: new Date(formData.date),
          updatedAt: new Date(),
        });
      } else {
        // Criar nova transação
        await addDoc(collection(db, 'transactions'), {
          ...formData,
          date: new Date(formData.date),
          createdBy: user?.email || 'unknown',
          createdByName: user?.displayName || 'Usuário',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{initialData?.id ? 'Editar Transação' : 'Nova Transação'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${formData.type === 'income'
                  ? 'border-green-500 bg-green-50
                  : 'border-slate-200
                  }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${formData.type === 'expense'
                  ? 'border-red-500 bg-red-50
                  : 'border-slate-200
                  }`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="text-sm font-medium mb-2 block">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Data */}
          <div>
            <label className="text-sm font-medium mb-2 block">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium mb-2 block">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Pagamento de conta de luz"
              required
            />
          </div>

          {/* Fornecedor e Nº Nota */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Fornecedor</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: CEMIG"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nº Nota/Recibo</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 123456"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Contexto */}
          <div>
            <label className="text-sm font-medium mb-2 block">Contexto</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contextId: 'HOME' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${formData.contextId === 'HOME'
                  ? 'border-blue-500 bg-blue-50
                  : 'border-slate-200
                  }`}
              >
                🏠 Casa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contextId: 'CLINIC' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${formData.contextId === 'CLINIC'
                  ? 'border-blue-500 bg-blue-50
                  : 'border-slate-200
                  }`}
              >
                🏥 Clínica
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'paid' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${formData.status === 'paid'
                  ? 'border-green-500 bg-green-50
                  : 'border-slate-200
                  }`}
              >
                Pago
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pending' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${formData.status === 'pending'
                  ? 'border-yellow-500 bg-yellow-50
                  : 'border-slate-200
                  }`}
              >
                Pendente
              </button>
            </div>
          </div>

          {/* URL do Anexo */}
          <div>
            <label className="text-sm font-medium mb-2 block">URL do Comprovante (opcional)</label>
            <input
              type="url"
              value={formData.attachmentUrl}
              onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

