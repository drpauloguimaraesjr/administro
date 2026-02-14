'use client';

import { Transaction } from '@/shared/types/index';
import { format } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Image as ImageIcon } from 'lucide-react';
import { ShareTransaction } from '../whatsapp/share-transaction';

interface ReportsTableProps {
  transactions: Transaction[];
}

export function ReportsTable({ transactions }: ReportsTableProps) {
  if (transactions.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Nenhuma transação encontrada</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Data</th>
            <th className="text-left p-3">Descrição</th>
            <th className="text-left p-3">Categoria</th>
            <th className="text-left p-3">Contexto</th>
            <th className="text-right p-3">Valor</th>
            <th className="text-center p-3">Status</th>
            <th className="text-center p-3">Anexo</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const date = transaction.date instanceof Date
              ? transaction.date
              : new Date(transaction.date);
            const isIncome = transaction.type === 'income';

            return (
              <tr key={transaction.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{format(date, 'dd/MM/yyyy')}</td>
                <td className="p-3 font-medium">{transaction.description}</td>
                <td className="p-3">{transaction.category}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">
                    {transaction.contextId === 'HOME' ? 'Casa' : 'Clínica'}
                  </span>
                </td>
                <td className={`p-3 text-right font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {isIncome ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'paid'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                    }`}>
                    {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {transaction.attachmentUrl && (
                      <a
                        href={transaction.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </a>
                    )}
                    <ShareTransaction transaction={transaction} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

