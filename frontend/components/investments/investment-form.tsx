'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Investment } from '@/shared/types/index';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/components/auth/auth-provider';

interface InvestmentFormProps {
  onClose: () => void;
  initialData?: Partial<Investment>;
}

const investmentTypes = [
  { value: 'real_estate', label: 'Imóvel' },
  { value: 'stocks', label: 'Ações' },
  { value: 'bonds', label: 'Títulos' },
  { value: 'crypto', label: 'Criptomoedas' },
  { value: 'other', label: 'Outros' },
];

export function InvestmentForm({ onClose, initialData }: InvestmentFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: (initialData?.type || 'other') as Investment['type'],
    totalAmount: initialData?.totalAmount || 0,
    investedAmount: initialData?.investedAmount || 0,
    contextId: (initialData?.contextId || 'HOME') as 'HOME' | 'CLINIC',
    installments: initialData?.installments || {
      total: 0,
      paid: 0,
      value: 0,
      dueDate: new Date().toISOString().split('T')[0],
    },
  });
  const [hasInstallments, setHasInstallments] = useState(!!initialData?.installments);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      alert('Firebase não está configurado');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'investments'), {
        ...formData,
        installments: hasInstallments ? formData.installments : undefined,
        createdBy: user?.email || 'unknown',
        createdByName: user?.displayName || 'Usuário',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      alert('Erro ao criar investimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Novo Investimento</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nome do Investimento</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Ex: Apartamento Centro"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              {investmentTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Valor Total */}
          <div>
            <label className="text-sm font-medium mb-2 block">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Valor Investido */}
          <div>
            <label className="text-sm font-medium mb-2 block">Valor Já Investido (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.investedAmount}
              onChange={(e) => setFormData({ ...formData, investedAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Contexto */}
          <div>
            <label className="text-sm font-medium mb-2 block">Contexto</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contextId: 'HOME' })}
                className={`flex-1 p-3 rounded-lg border-2 ${formData.contextId === 'HOME'
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                  }`}
              >
                🏠 Casa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, contextId: 'CLINIC' })}
                className={`flex-1 p-3 rounded-lg border-2 ${formData.contextId === 'CLINIC'
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                  }`}
              >
                🏥 Clínica
              </button>
            </div>
          </div>

          {/* Parcelas */}
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={hasInstallments}
                onChange={(e) => setHasInstallments(e.target.checked)}
              />
              <span className="text-sm font-medium">Tem parcelas?</span>
            </label>
            {hasInstallments && (
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <label className="text-sm mb-1 block">Total de Parcelas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.installments.total}
                    onChange={(e) => setFormData({
                      ...formData,
                      installments: { ...formData.installments, total: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Parcelas Pagas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.installments.paid}
                    onChange={(e) => setFormData({
                      ...formData,
                      installments: { ...formData.installments, paid: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Valor da Parcela (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.installments.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      installments: { ...formData.installments, value: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}
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

