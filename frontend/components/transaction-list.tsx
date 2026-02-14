'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '@/shared/types/index';
import { format } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Image as ImageIcon, Edit } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ShareTransaction } from './whatsapp/share-transaction';
import { TransactionForm } from './transactions/transaction-form';
import { Button } from './ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  contextId?: 'HOME' | 'CLINIC';
}

export function TransactionList({ transactions, contextId }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          <p className="text-sm text-muted-foreground mt-2">
            Envie um comprovante via WhatsApp para começar!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <TransactionCard transaction={transaction} />
        </motion.div>
      ))}
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const [editing, setEditing] = useState(false);
  const isIncome = transaction.type === 'income';
  const date = transaction.date instanceof Date
    ? transaction.date
    : new Date(transaction.date);

  if (editing) {
    return (
      <TransactionForm
        initialData={transaction}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <Card className="hover:border-foreground/30 transition-colors duration-150">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 ${isIncome
                ? 'bg-primary/10 text-primary'
                : 'bg-destructive/10 text-destructive'
              }`}>
              {isIncome ? (
                <ArrowUpCircle className="w-5 h-5" />
              ) : (
                <ArrowDownCircle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold truncate">{transaction.description}</p>
                {transaction.attachmentUrl && (
                  <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>{transaction.category}</span>
                <span>•</span>
                <span>{format(date, "dd/MM/yyyy")}</span>
                {transaction.contextId && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 border border-border text-muted-foreground text-xs">
                      {transaction.contextId === 'HOME' ? 'Casa' : 'Clínica'}
                    </span>
                  </>
                )}
                {transaction.createdByName && (
                  <>
                    <span>•</span>
                    <span className="text-xs">por {transaction.createdByName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right space-y-2">
            <p className={`text-lg font-bold font-mono ${isIncome ? 'text-primary' : 'text-destructive'
              }`}>
              {isIncome ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
            </p>
            {transaction.status === 'pending' && (
              <span className="text-xs text-yellow-600">Pendente</span>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <ShareTransaction transaction={transaction} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

