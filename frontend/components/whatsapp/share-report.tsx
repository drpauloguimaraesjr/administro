'use client';

import { Transaction } from '@/shared/types/index';
import { ShareButton } from './share-button';

interface ShareReportProps {
  transactions: Transaction[];
  period: string;
  context?: string;
}

export function ShareReport({ transactions, period, context }: ShareReportProps) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const text = `📊 *Relatório Financeiro*

📅 *Período:* ${period}
${context ? `📍 *Contexto:* ${context}` : ''}

💰 *Receitas:* R$ ${income.toFixed(2)}
💸 *Despesas:* R$ ${expenses.toFixed(2)}
💵 *Saldo:* R$ ${balance.toFixed(2)}

📈 *Total de Transações:* ${transactions.length}`;

  return <ShareButton text={text} />;
}

