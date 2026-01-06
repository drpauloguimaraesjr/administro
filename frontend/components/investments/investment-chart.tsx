'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Investment } from '../../../shared/types/index';

interface InvestmentChartProps {
  investments: Investment[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function InvestmentChart({ investments }: InvestmentChartProps) {
  const data = useMemo(() => {
    const byType: Record<string, number> = {};
    
    investments.forEach(inv => {
      const type = inv.type.replace('_', ' ');
      if (!byType[type]) {
        byType[type] = 0;
      }
      byType[type] += inv.totalAmount;
    });

    return Object.entries(byType)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [investments]);

  if (data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Nenhum dado para exibir</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

