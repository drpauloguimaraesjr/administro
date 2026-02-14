'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface Filters {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  contextId: 'all' | 'HOME' | 'CLINIC';
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  status: 'all' | 'paid' | 'pending';
}

interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
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

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      category: 'all',
      contextId: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      status: 'all',
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">Todos</option>
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            {/* Categoria */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Contexto */}
            <div>
              <label className="text-sm font-medium mb-2 block">Contexto</label>
              <select
                value={filters.contextId}
                onChange={(e) => updateFilter('contextId', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">Todos</option>
                <option value="HOME">Casa</option>
                <option value="CLINIC">Clínica</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">Todos</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
              </select>
            </div>

            {/* Data Inicial */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Data Final */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Valor Mínimo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Valor Mínimo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={filters.minAmount}
                onChange={(e) => updateFilter('minAmount', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>

            {/* Valor Máximo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Valor Máximo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={filters.maxAmount}
                onChange={(e) => updateFilter('maxAmount', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="999999.99"
              />
            </div>
          </div>

          {/* Botão Limpar */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

