'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Investment } from '@/shared/types/index';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvestmentForm } from '@/components/investments/investment-form';
import { InvestmentList } from '@/components/investments/investment-list';
import { InvestmentChart } from '@/components/investments/investment-chart';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'investments'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invs: Investment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        invs.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          totalAmount: data.totalAmount || 0,
          investedAmount: data.investedAmount || 0,
          installments: data.installments,
          contextId: data.contextId,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        });
      });
      setInvestments(invs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const profit = totalValue - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Investimentos</h1>
            <p className="text-muted-foreground">Gerencie seus investimentos e parcelas</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Investimento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-2xl font-bold">R$ {totalInvested.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Atual</p>
                  <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro/Prejuízo</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}R$ {profit.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className={`w-8 h-8 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rentabilidade</p>
                  <p className={`text-2xl font-bold ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <InvestmentForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentChart investments={investments} />
          </CardContent>
        </Card>

        {/* List */}
        <InvestmentList investments={investments} />
      </div>
    </div>
  );
}

