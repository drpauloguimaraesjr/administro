'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface StatsCardsProps {
  balance: number;
  income: number;
  expenses: number;
  transactionsCount: number;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: string | null;
  trendUp?: boolean;
  color: string;
  isCount?: boolean;
}

export function StatsCards({ balance, income, expenses, transactionsCount }: StatsCardsProps) {
  const stats: StatItem[] = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Saldo Total',
      value: balance,
      trend: null,
      trendUp: true,
      color: 'blue',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Receitas',
      value: income,
      trend: null,
      trendUp: true,
      color: 'green',
    },
    {
      icon: <TrendingDown className="w-6 h-6" />,
      label: 'Despesas',
      value: expenses,
      trend: null,
      trendUp: false,
      color: 'red',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Este Mês',
      value: transactionsCount,
      isCount: true,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover: transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color === 'blue' ? 'bg-primary/15 text-primary' :
                  stat.color === 'green' ? 'bg-primary/15 text-primary' :
                    stat.color === 'red' ? 'bg-destructive/15 text-destructive' :
                      'bg-primary/15 text-primary'
                  }`}>
                  {stat.icon}
                </div>
                {stat.trend && (
                  <span className={`text-sm font-medium ${stat.trendUp ? 'text-primary' : 'text-destructive'
                    }`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold">
                {stat.isCount ? (
                  `${stat.value} transações`
                ) : (
                  `R$ ${stat.value.toFixed(2)}`
                )}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

