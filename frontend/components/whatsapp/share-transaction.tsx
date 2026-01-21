'use client';

import { Transaction } from '@/shared/types/index';
import { ShareButton } from './share-button';
import { format } from 'date-fns';

interface ShareTransactionProps {
  transaction: Transaction;
}

export function ShareTransaction({ transaction }: ShareTransactionProps) {
  const date = transaction.date instanceof Date
    ? transaction.date
    : new Date(transaction.date);

  const text = `📋 *Transação Financeira*

💰 *Valor:* R$ ${transaction.amount.toFixed(2)}
📅 *Data:* ${format(date, 'dd/MM/yyyy')}
📝 *Descrição:* ${transaction.description}
🏷️ *Categoria:* ${transaction.category}
📍 *Contexto:* ${transaction.contextId === 'HOME' ? '🏠 Casa' : '🏥 Clínica'}
${transaction.status === 'pending' ? '⚠️ *Status:* Pendente' : '✅ *Status:* Pago'}
${transaction.attachmentUrl ? `📎 *Comprovante:* ${transaction.attachmentUrl}` : ''}`;

  return (
    <ShareButton
      text={text}
      imageUrl={transaction.attachmentUrl}
      transactionId={transaction.id}
    />
  );
}

