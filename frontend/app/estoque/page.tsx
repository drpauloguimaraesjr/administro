'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package, AlertTriangle, Plus, Search,
  RefreshCw, Box, Pill, Droplet, ShieldAlert, Bell, TrendingUp
} from 'lucide-react';
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

// ─── MOCK DATA ───
const mockSummary: InventorySummary = {
  totalItems: 24,
  totalValue: 48750.00,
  lowStockCount: 3,
  outOfStockCount: 1,
  expiringCount: 2,
  expiredCount: 0,
  criticalAlerts: 1,
  warningAlerts: 4,
};

const mockItems: InventoryItem[] = [
  { id: '1', name: 'Testosterona Base Micronizada', category: 'medicamento', unit: 'g', currentQuantity: 180, minStock: 50, costPrice: 42.00, sellPrice: 85.00 },
  { id: '2', name: 'Gestrinona', category: 'medicamento', unit: 'g', currentQuantity: 45, minStock: 30, costPrice: 95.00, sellPrice: 190.00 },
  { id: '3', name: 'Oxandrolona', category: 'medicamento', unit: 'g', currentQuantity: 12, minStock: 25, costPrice: 120.00, sellPrice: 250.00 },
  { id: '4', name: 'DHEA', category: 'medicamento', unit: 'g', currentQuantity: 90, minStock: 40, costPrice: 38.00, sellPrice: 75.00 },
  { id: '5', name: 'Pregnenolona', category: 'medicamento', unit: 'g', currentQuantity: 60, minStock: 20, costPrice: 55.00, sellPrice: 110.00 },
  { id: '6', name: 'Trocarte 10G (Implante)', category: 'material', unit: 'un', currentQuantity: 150, minStock: 50, costPrice: 8.50, sellPrice: 15.00 },
  { id: '7', name: 'Trocarte 8G (Implante)', category: 'material', unit: 'un', currentQuantity: 85, minStock: 30, costPrice: 9.00, sellPrice: 16.00 },
  { id: '8', name: 'Agulha Hipodérmica 40x12', category: 'material', unit: 'un', currentQuantity: 500, minStock: 100, costPrice: 0.35, sellPrice: 0.80 },
  { id: '9', name: 'Luva Procedimento M', category: 'material', unit: 'cx', currentQuantity: 8, minStock: 10, costPrice: 28.00, sellPrice: 45.00 },
  { id: '10', name: 'Lidocaína 2% s/ Vaso', category: 'medicamento', unit: 'amp', currentQuantity: 0, minStock: 20, costPrice: 4.50, sellPrice: 12.00 },
  { id: '11', name: 'Curativo Tegaderm 6x7', category: 'material', unit: 'un', currentQuantity: 200, minStock: 50, costPrice: 3.80, sellPrice: 8.00 },
  { id: '12', name: 'Clorexidina Alcoólica 0,5%', category: 'cosmético', unit: 'L', currentQuantity: 5, minStock: 3, costPrice: 22.00, sellPrice: 40.00 },
];

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: apiSummary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: async () => {
      try {
        const response = await api.get('/inventory/summary');
        return response.data as InventorySummary;
      } catch { return null; }
    }
  });

  const { data: apiItems, isLoading: loadingItems } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      try {
        const response = await api.get('/inventory');
        return response.data as InventoryItem[];
      } catch { return []; }
    }
  });

  const summary = apiSummary || mockSummary;
  const items = (apiItems && apiItems.length > 0) ? apiItems : mockItems;

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
    if (item.currentQuantity <= 0) return { label: 'Esgotado', style: 'border-destructive/30 text-destructive' };
    if (item.currentQuantity <= item.minStock * 0.5) return { label: 'Crítico', style: 'border-destructive/30 text-destructive' };
    if (item.currentQuantity <= item.minStock) return { label: 'Baixo', style: 'border-[#c48a3a]/30 text-[#c48a3a]' };
    return { label: 'OK', style: 'border-[#7c9a72]/30 text-[#6b8a62]' };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 4, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.15 } },
  };

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Estoque</h1>
            <p className="font-mono text-sm text-muted-foreground">Gestão de produtos e insumos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => checkAlertsMutation.mutate()}
              disabled={checkAlertsMutation.isPending}
              className="h-9 px-4 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors duration-150 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkAlertsMutation.isPending ? 'animate-spin' : ''}`} />
              Verificar Alertas
            </button>
            <button className="h-9 px-4 bg-[#7c9a72] hover:bg-[#6b8a62] text-white font-mono text-xs uppercase tracking-[0.15em] border-0 transition-colors duration-150 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Novo Produto
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="Total de Produtos"
            value={summary?.totalItems || 0}
            subtext={`Valor: R$ ${(summary?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Estoque Baixo"
            value={summary?.lowStockCount || 0}
            subtext={`Esgotados: ${summary?.outOfStockCount || 0}`}
          />
          <StatCard
            icon={<ShieldAlert className="w-4 h-4" />}
            label="Vencendo (30 dias)"
            value={summary?.expiringCount || 0}
            subtext={`Vencidos: ${summary?.expiredCount || 0}`}
          />
          <StatCard
            icon={<Bell className="w-4 h-4" />}
            label="Alertas Ativos"
            value={summary?.criticalAlerts || 0}
            subtext={`Avisos: ${summary?.warningAlerts || 0}`}
          />
        </motion.div>

        {/* Navigation Links */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <Link href="/estoque/alertas">
            <button className="h-9 px-4 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors duration-150 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" /> Alertas
            </button>
          </Link>
          <Link href="/estoque/consumo">
            <button className="h-9 px-4 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors duration-150 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" /> Análise de Consumo
            </button>
          </Link>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-foreground/50 transition-colors"
          />
        </motion.div>

        {/* Items Table */}
        <motion.div variants={itemVariants} className="border border-border bg-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-serif text-lg font-bold text-foreground">Produtos em Estoque</h2>
          </div>

          {loadingItems ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-mono text-sm text-muted-foreground">
                {items?.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-6 mono-label text-muted-foreground">Produto</th>
                    <th className="text-left py-3 px-4 mono-label text-muted-foreground">Categoria</th>
                    <th className="text-right py-3 px-4 mono-label text-muted-foreground">Quantidade</th>
                    <th className="text-right py-3 px-4 mono-label text-muted-foreground">Mínimo</th>
                    <th className="text-right py-3 px-4 mono-label text-muted-foreground">Custo</th>
                    <th className="text-center py-3 px-6 mono-label text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-150 cursor-pointer group"
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="text-[#7c9a72] group-hover:text-[#6b8a62] transition-colors">
                              {getCategoryIcon(item.category)}
                            </div>
                            <span className="font-serif font-semibold text-foreground group-hover:text-[#7c9a72] transition-colors">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground capitalize">{item.category}</td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-medium text-foreground">
                          {item.currentQuantity} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                          R$ {(item.costPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`font-mono text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 border ${status.style}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="border border-border bg-card p-5 hover:border-foreground/30 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-3xl font-medium text-foreground mb-1 tracking-tight">
            {value}
          </p>
          <p className="mono-label text-muted-foreground">{label}</p>
          {subtext && (
            <p className="font-mono text-xs text-muted-foreground mt-1.5 italic">
              {subtext}
            </p>
          )}
        </div>
        <div className="text-[#7c9a72]">
          {icon}
        </div>
      </div>
    </div>
  );
}
