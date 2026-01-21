'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/shared/types/index';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'income' | 'expense',
    category: 'all',
    contextId: 'all' as 'all' | 'HOME' | 'CLINIC',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    status: 'all' as 'all' | 'paid' | 'pending',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transações</h1>
            <p className="text-muted-foreground">Gerencie todas as suas transações financeiras</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(!showForm)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TransactionFilters filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TransactionForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}

        {/* Transactions List */}
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}

