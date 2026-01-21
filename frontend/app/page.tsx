'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import { ContextSelector } from '@/components/context-selector';
import { StatsCards } from '@/components/stats-cards';
import { TransactionList } from '@/components/transaction-list';
import { Transaction, ContextType } from '@/shared/types/index';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedContext, setSelectedContext] = useState<ContextType>('OVERVIEW');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    transactionsCount: 0,
  });

  // Redireciona se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // Verifica se Firebase está configurado
  useEffect(() => {
    if (!db && !authLoading) {
      console.error('❌ Firebase não está configurado. Verifique as variáveis de ambiente no Vercel.');
    }
  }, [db, authLoading]);

  // Buscar transações do Firestore
  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    let q;
    if (selectedContext === 'OVERVIEW') {
      q = query(
        collection(db, 'transactions'),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        collection(db, 'transactions'),
        where('contextId', '==', selectedContext),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans: Transaction[] = [];
      let income = 0;
      let expenses = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const transaction: Transaction = {
          id: doc.id,
          amount: data.amount || 0,
          type: data.type,
          status: data.status || 'paid',
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          description: data.description || '',
          category: data.category || 'Outros',
          contextId: data.contextId,
          attachmentUrl: data.attachmentUrl,
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        };

        trans.push(transaction);

        if (transaction.type === 'income') {
          income += transaction.amount;
        } else {
          expenses += transaction.amount;
        }
      });

      setTransactions(trans);
      setStats({
        balance: income - expenses,
        income,
        expenses,
        transactionsCount: trans.length,
      });
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar transações:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedContext, user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <motion.h1
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Administrador de Contas
            </motion.h1>
            <p className="text-muted-foreground">
              Sistema de gestão financeira pessoal e empresarial
            </p>
          </motion.div>

          {/* Context Selector */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <ContextSelector
              selectedContext={selectedContext}
              onContextChange={setSelectedContext}
            />
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants}>
            <StatsCards {...stats} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <ActionCard
              icon={<Plus className="w-6 h-6" />}
              title="Adicionar Transação"
              description="Registre uma nova receita ou despesa"
              href="/transactions"
            />
            <ActionCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Ver Relatórios"
              description="Analise seus gastos e receitas"
              href="/reports"
            />
            <ActionCard
              icon={<Wallet className="w-6 h-6" />}
              title="Investimentos"
              description="Gerencie seus investimentos"
              href="/investments"
            />
          </motion.div>

          {/* Transactions List */}
          <motion.div variants={itemVariants}>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Transações Recentes</h2>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Carregando transações...
                </div>
              ) : (
                <TransactionList
                  transactions={transactions.slice(0, 10)}
                  contextId={selectedContext === 'OVERVIEW' ? undefined : selectedContext}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

function ActionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push(href)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-left border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all w-full"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400 w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}
