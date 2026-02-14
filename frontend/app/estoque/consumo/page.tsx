'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, ArrowLeft, RefreshCw,
  Calendar, Package, AlertTriangle, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import api from '@/lib/api';

interface ConsumptionAnalysis {
  itemId: string;
  itemName: string;
  period: number;
  totalConsumed: number;
  averageDaily: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  trendPercentage: number;
  currentStock: number;
  estimatedDaysUntilStockout: number;
  recommendedReorderDate: string | null;
  consumptionHistory: Array<{ date: string; quantity: number }>;
}

export default function ConsumoPage() {
  const [period, setPeriod] = useState('30');

  const { data: consumptions, isLoading } = useQuery({
    queryKey: ['inventory-consumption', period],
    queryFn: async () => {
      const response = await api.get('/inventory/consumption/summary', { params: { period } });
      return response.data as ConsumptionAnalysis[];
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground/70" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      default: return 'text-muted-foreground/70';
    }
  };

  const getStockoutBadge = (days: number) => {
    if (days < 0) return <Badge className="bg-primary/100">Sem consumo</Badge>;
    if (days <= 7) return <Badge className="bg-destructive/100">Crítico ({days} dias)</Badge>;
    if (days <= 14) return <Badge className="bg-orange-500">Alerta ({days} dias)</Badge>;
    if (days <= 30) return <Badge className="bg-yellow-500">Atenção ({days} dias)</Badge>;
    return <Badge className="bg-primary/100">{days} dias</Badge>;
  };

  // Estatísticas
  const stats = {
    totalConsumed: consumptions?.reduce((sum, c) => sum + c.totalConsumed, 0) || 0,
    increasing: consumptions?.filter(c => c.trend === 'increasing').length || 0,
    critical: consumptions?.filter(c => c.estimatedDaysUntilStockout > 0 && c.estimatedDaysUntilStockout <= 14).length || 0,
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/estoque">
              <Button variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                Análise de Consumo
              </h1>
              <p className="text-muted-foreground/70 mt-1">Tendências e previsões de estoque</p>
            </div>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-foreground/90 border-border">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-foreground/90/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Total Consumido</p>
                    <p className="text-2xl font-bold text-white">{stats.totalConsumed}</p>
                    <p className="text-muted-foreground text-xs">nos últimos {period} dias</p>
                  </div>
                  <div className="p-3 rounded-full bg-cyan-500/20">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-foreground/90/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Consumo Crescente</p>
                    <p className="text-2xl font-bold text-red-400">{stats.increasing}</p>
                    <p className="text-muted-foreground text-xs">produtos com alta demanda</p>
                  </div>
                  <div className="p-3 rounded-full bg-destructive/100/20">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-foreground/90/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Risco de Falta</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.critical}</p>
                    <p className="text-muted-foreground text-xs">esgotam em até 14 dias</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-500/20">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Consumption List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : consumptions?.length === 0 ? (
          <Card className="bg-foreground/90/50 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground/70 text-lg">Nenhum dado de consumo</p>
              <p className="text-muted-foreground text-sm">Registre movimentações de saída para ver análises</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-foreground/90/50 border-border">
            <CardHeader>
              <CardTitle className="text-white">Produtos Mais Consumidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground/70 font-medium">Produto</th>
                      <th className="text-right py-3 px-4 text-muted-foreground/70 font-medium">Consumido</th>
                      <th className="text-right py-3 px-4 text-muted-foreground/70 font-medium">Média/Dia</th>
                      <th className="text-center py-3 px-4 text-muted-foreground/70 font-medium">Tendência</th>
                      <th className="text-right py-3 px-4 text-muted-foreground/70 font-medium">Estoque Atual</th>
                      <th className="text-center py-3 px-4 text-muted-foreground/70 font-medium">Previsão Esgotamento</th>
                      <th className="text-center py-3 px-4 text-muted-foreground/70 font-medium">Repor Até</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumptions?.map((item, index) => (
                      <motion.tr
                        key={item.itemId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-slate-700/30"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-700/50">
                              <Package className="w-4 h-4 text-muted-foreground/70" />
                            </div>
                            <span className="text-white font-medium">{item.itemName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-white font-semibold">
                          {item.totalConsumed}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground/50">
                          {item.averageDaily.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getTrendIcon(item.trend)}
                            <span className={getTrendColor(item.trend)}>
                              {item.trendPercentage > 0 ? '+' : ''}{item.trendPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-white">
                          {item.currentStock}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStockoutBadge(item.estimatedDaysUntilStockout)}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground/50">
                          {item.recommendedReorderDate ? (
                            <div className="flex items-center justify-center gap-2">
                              <Calendar className="w-4 h-4 text-cyan-400" />
                              {new Date(item.recommendedReorderDate).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
