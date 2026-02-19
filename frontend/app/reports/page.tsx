'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import { Transaction } from '@/shared/types/index';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MonthlyChart,
  CategoryChart,
  ContextComparisonChart,
  TrendChart,
  IncomeExpenseChart
} from '@/components/reports/charts';
import { ReportsTable } from '@/components/reports/reports-table';
import { ExportOptions } from '@/components/reports/export-options';
import { ShareReport } from '@/components/whatsapp/share-report';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [selectedContext, setSelectedContext] = useState<'all' | 'HOME' | 'CLINIC'>('all');

  // Buscar transações
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    let q = query(collection(db, 'transactions'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        trans.push({
          id: doc.id,
          amount: data.amount || 0,
          type: data.type,
          status: data.status || 'paid',
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          description: data.description || '',
          category: data.category || 'Outros',
          contextId: data.contextId,
          attachmentUrl: data.attachmentUrl,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        });
      });
      setTransactions(trans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtrar por contexto
    if (selectedContext !== 'all') {
      filtered = filtered.filter(t => t.contextId === selectedContext);
    }

    // Filtrar por período
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return filtered;
    }

    filtered = filtered.filter(t => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      return date >= startDate;
    });

    return filtered;
  }, [transactions, dateRange, selectedContext]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const transactionCount = filteredTransactions.length;

    // Por categoria
    const byCategory: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byCategory[t.category].income += t.amount;
      } else {
        byCategory[t.category].expense += t.amount;
      }
    });

    // Por contexto
    const byContext: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach(t => {
      const ctx = t.contextId || 'unknown';
      if (!byContext[ctx]) {
        byContext[ctx] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byContext[ctx].income += t.amount;
      } else {
        byContext[ctx].expense += t.amount;
      }
    });

    return {
      income,
      expenses,
      balance,
      transactionCount,
      byCategory,
      byContext,
    };
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
            <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
          </div>
          <div className="flex gap-2">
            <ShareReport
              transactions={filteredTransactions}
              period={dateRange}
              context={selectedContext !== 'all' ? (selectedContext === 'HOME' ? 'Casa' : 'Clínica') : undefined}
            />
            <ExportOptions transactions={filteredTransactions} />
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="week">Última Semana</option>
                  <option value="month">Este Mês</option>
                  <option value="quarter">Este Trimestre</option>
                  <option value="year">Este Ano</option>
                  <option value="all">Todo Período</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Contexto</label>
                <select
                  value={selectedContext}
                  onChange={(e) => setSelectedContext(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">Todos</option>
                  <option value="HOME">Casa</option>
                  <option value="CLINIC">Clínica</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    R$ {stats.balance.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <p className="text-2xl font-bold text-primary">R$ {stats.income.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-2xl font-bold text-destructive">R$ {stats.expenses.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transações</p>
                  <p className="text-2xl font-bold">{stats.transactionCount}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart transactions={filteredTransactions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart transactions={filteredTransactions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart transactions={filteredTransactions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Casa vs Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <ContextComparisonChart transactions={filteredTransactions} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendência</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart transactions={filteredTransactions} />
            </CardContent>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportsTable transactions={filteredTransactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

