'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, TrendingUp, Plus, Search,
  RefreshCw, Box, Pill, Droplet, ShieldAlert, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';

interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  expiredCount: number;
  criticalAlerts: number;
  warningAlerts: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minStock: number;
  costPrice?: number;
  sellPrice?: number;
}

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: async () => {
      const response = await api.get('/inventory/summary');
      return response.data as InventorySummary;
    }
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const response = await api.get('/inventory');
      return response.data as InventoryItem[];
    }
  });

  const checkAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/inventory/alerts/check');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
    }
  });

  const filteredItems = items?.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicamento': return <Pill className="w-4 h-4" />;
      case 'material': return <Box className="w-4 h-4" />;
      case 'cosmético': return <Droplet className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentQuantity <= 0) return { label: 'Esgotado', color: 'bg-destructive/100' };
    if (item.currentQuantity <= item.minStock * 0.5) return { label: 'Crítico', color: 'bg-red-400' };
    if (item.currentQuantity <= item.minStock) return { label: 'Baixo', color: 'bg-yellow-500' };
    return { label: 'OK', color: 'bg-primary/100' };
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
              Estoque
            </h1>
            <p className="text-muted-foreground/70 mt-1">Gestão de produtos e insumos</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => checkAlertsMutation.mutate()}
              disabled={checkAlertsMutation.isPending}
              className="border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${checkAlertsMutation.isPending ? 'animate-spin' : ''}`} />
              Verificar Alertas
            </Button>
            <Button className="bg-primary hover:from-cyan-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-foreground/90/50 border-border backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Total de Produtos</p>
                    <p className="text-2xl font-bold text-white">{summary?.totalItems || 0}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Valor: R$ {(summary?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-cyan-500/20">
                    <Package className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-foreground/90/50 border-border backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Estoque Baixo</p>
                    <p className="text-2xl font-bold text-yellow-400">{summary?.lowStockCount || 0}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Esgotados: {summary?.outOfStockCount || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500/20">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-foreground/90/50 border-border backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Vencendo (30 dias)</p>
                    <p className="text-2xl font-bold text-orange-400">{summary?.expiringCount || 0}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Vencidos: {summary?.expiredCount || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-500/20">
                    <ShieldAlert className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-foreground/90/50 border-border backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground/70 text-sm">Alertas Ativos</p>
                    <p className="text-2xl font-bold text-red-400">{summary?.criticalAlerts || 0}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Avisos: {summary?.warningAlerts || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-destructive/100/20">
                    <Bell className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          <Link href="/estoque/alertas">
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
              <Bell className="w-4 h-4 mr-2" />
              Alertas
            </Button>
          </Link>
          <Link href="/estoque/consumo">
            <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Análise de Consumo
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-5 h-5" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-foreground/90/50 border-border text-white placeholder:text-muted-foreground"
          />
        </div>

        {/* Items Table */}
        <Card className="bg-foreground/90/50 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Produtos em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground/70">
                {items?.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground/70 font-medium">Produto</th>
                      <th className="text-left py-3 px-4 text-muted-foreground/70 font-medium">Categoria</th>
                      <th className="text-right py-3 px-4 text-muted-foreground/70 font-medium">Quantidade</th>
                      <th className="text-right py-3 px-4 text-muted-foreground/70 font-medium">Mínimo</th>
                      <th className="text-right py-3 px-4 text-muted-foreground/70 font-medium">Custo</th>
                      <th className="text-center py-3 px-4 text-muted-foreground/70 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-border/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-slate-700/50">
                                {getCategoryIcon(item.category)}
                              </div>
                              <span className="text-white font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground/70 capitalize">{item.category}</td>
                          <td className="py-3 px-4 text-right text-white font-medium">
                            {item.currentQuantity} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground/70">
                            {item.minStock} {item.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground/70">
                            R$ {(item.costPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
