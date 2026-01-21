'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '@/shared/types/index';
import { format, startOfMonth, eachMonthOfInterval } from 'date-fns';

interface ChartProps {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Gráfico de Receitas vs Despesas
export function IncomeExpenseChart({ transactions }: ChartProps) {
  const data = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Receitas', value: income, fill: '#10b981' },
      { name: 'Despesas', value: expenses, fill: '#ef4444' },
    ];
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gráfico por Categoria
export function CategoryChart({ transactions }: ChartProps) {
  const data = useMemo(() => {
    const byCategory: Record<string, number> = {};

    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      if (t.type === 'expense') {
        byCategory[t.category] += t.amount;
      }
    });

    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Gráfico Mensal
export function MonthlyChart({ transactions }: ChartProps) {
  const data = useMemo(() => {
    if (transactions.length === 0) return [];

    const dates = transactions.map(t =>
      t.date instanceof Date ? t.date : new Date(t.date)
    );
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const months = eachMonthOfInterval({ start: minDate, end: maxDate });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const date = t.date instanceof Date ? t.date : new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM/yyyy'),
        receitas: income,
        despesas: expenses,
        saldo: income - expenses,
      };
    });
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
        <Legend />
        <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} />
        <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
        <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Comparação Casa vs Clínica
export function ContextComparisonChart({ transactions }: ChartProps) {
  const data = useMemo(() => {
    const home = {
      income: transactions
        .filter(t => t.contextId === 'HOME' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expense: transactions
        .filter(t => t.contextId === 'HOME' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    const clinic = {
      income: transactions
        .filter(t => t.contextId === 'CLINIC' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expense: transactions
        .filter(t => t.contextId === 'CLINIC' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    return [
      { name: 'Casa', receitas: home.income, despesas: home.expense },
      { name: 'Clínica', receitas: clinic.income, despesas: clinic.expense },
    ];
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="receitas" fill="#10b981" />
        <Bar dataKey="despesas" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gráfico de Tendência
export function TrendChart({ transactions }: ChartProps) {
  const data = useMemo(() => {
    if (transactions.length === 0) return [];

    const sorted = [...transactions].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    let cumulativeBalance = 0;
    return sorted.map(t => {
      if (t.type === 'income') {
        cumulativeBalance += t.amount;
      } else {
        cumulativeBalance -= t.amount;
      }
      return {
        date: format(t.date instanceof Date ? t.date : new Date(t.date), 'dd/MM'),
        saldo: cumulativeBalance,
      };
    });
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
        <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

