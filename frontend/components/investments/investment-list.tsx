'use client';

import { motion } from 'framer-motion';
import { Investment } from '../../../shared/types/index';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, TrendingUp, Calendar } from 'lucide-react';

interface InvestmentListProps {
  investments: Investment[];
}

export function InvestmentList({ investments }: InvestmentListProps) {
  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum investimento cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {investments.map((investment, index) => (
        <motion.div
          key={investment.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <InvestmentCard investment={investment} />
        </motion.div>
      ))}
    </div>
  );
}

function InvestmentCard({ investment }: { investment: Investment }) {
  const progress = investment.totalAmount > 0 
    ? (investment.investedAmount / investment.totalAmount) * 100 
    : 0;
  
  const profit = investment.totalAmount - investment.investedAmount;
  const profitPercentage = investment.investedAmount > 0 
    ? (profit / investment.investedAmount) * 100 
    : 0;

  const installmentProgress = investment.installments && investment.installments.total > 0
    ? (investment.installments.paid / investment.installments.total) * 100
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{investment.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {investment.type.replace('_', ' ')}
              </p>
            </div>
            <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs">
              {investment.contextId === 'HOME' ? 'Casa' : 'Clínica'}
            </span>
          </div>

          {/* Valores */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Investido</span>
              <span className="font-semibold">R$ {investment.investedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor Atual</span>
              <span className="font-semibold">R$ {investment.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lucro/Prejuízo</span>
              <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit >= 0 ? '+' : ''}R$ {profit.toFixed(2)} ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Progresso */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Parcelas */}
          {investment.installments && investment.installments.total > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  Parcelas: {investment.installments.paid}/{investment.installments.total}
                </span>
                <span className="font-medium">{installmentProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${installmentProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor da parcela: R$ {investment.installments.value.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

