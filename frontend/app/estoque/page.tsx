'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, AlertTriangle, Plus, Search,
  RefreshCw, Box, Pill, Droplet, ShieldAlert, Bell, TrendingUp,
  TrendingDown, Minus, ChevronDown, ChevronUp, Calendar, Truck,
  ArrowUpRight, ArrowDownRight, Clock, Syringe, X
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

// ─── TYPES ───
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
  genericName?: string;
  category: string;
  unit: string;
  currentQuantity: number;
  minStock: number;
  maxStock?: number;
  costPrice?: number;
  sellPrice?: number;
  avgDailyConsumption?: number;
  daysUntilStockout?: number;
  lastRestock?: string;
  supplier?: string;
}

interface Supplier {
  id: string;
  name: string;
  deliveryDays: number;
  pricePerUnit: number;
  contact?: string;
}

// ─── MOCK DATA (Rich, realistic) ───
const mockSummary: InventorySummary = {
  totalItems: 32,
  totalValue: 127450.00,
  lowStockCount: 5,
  outOfStockCount: 1,
  expiringCount: 3,
  expiredCount: 1,
  criticalAlerts: 2,
  warningAlerts: 6,
};

const mockItems: InventoryItem[] = [
  // Tirzepatida / GLP-1
  { id: '1', name: 'Tirzepatida 2.5mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 8, minStock: 10, maxStock: 40, costPrice: 1850.00, sellPrice: 2800.00, avgDailyConsumption: 1.2, daysUntilStockout: 7, lastRestock: '2026-02-28', supplier: 'Eli Lilly Brasil' },
  { id: '2', name: 'Tirzepatida 5mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 15, minStock: 10, maxStock: 40, costPrice: 1950.00, sellPrice: 3000.00, avgDailyConsumption: 0.8, daysUntilStockout: 19, lastRestock: '2026-03-01', supplier: 'Eli Lilly Brasil' },
  { id: '3', name: 'Tirzepatida 7.5mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 6, minStock: 8, maxStock: 30, costPrice: 2100.00, sellPrice: 3200.00, avgDailyConsumption: 0.5, daysUntilStockout: 12, lastRestock: '2026-02-20', supplier: 'Eli Lilly Brasil' },
  { id: '4', name: 'Tirzepatida 10mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 3, minStock: 5, maxStock: 20, costPrice: 2250.00, sellPrice: 3400.00, avgDailyConsumption: 0.3, daysUntilStockout: 10, lastRestock: '2026-02-15', supplier: 'Eli Lilly Brasil' },

  // Hormônios / Implantes
  { id: '5', name: 'Testosterona Base Micronizada', genericName: 'Testosterona', category: 'medicamento', unit: 'g', currentQuantity: 180, minStock: 50, maxStock: 500, costPrice: 42.00, sellPrice: 85.00, avgDailyConsumption: 8.5, daysUntilStockout: 21, lastRestock: '2026-03-05' },
  { id: '6', name: 'Gestrinona', category: 'medicamento', unit: 'g', currentQuantity: 45, minStock: 30, maxStock: 200, costPrice: 95.00, sellPrice: 190.00, avgDailyConsumption: 3.2, daysUntilStockout: 14, lastRestock: '2026-02-25' },
  { id: '7', name: 'Oxandrolona', category: 'medicamento', unit: 'g', currentQuantity: 12, minStock: 25, maxStock: 150, costPrice: 120.00, sellPrice: 250.00, avgDailyConsumption: 2.0, daysUntilStockout: 6, lastRestock: '2026-02-18' },
  { id: '8', name: 'DHEA', category: 'medicamento', unit: 'g', currentQuantity: 90, minStock: 40, maxStock: 200, costPrice: 38.00, sellPrice: 75.00, avgDailyConsumption: 1.5, daysUntilStockout: 60, lastRestock: '2026-03-02' },
  { id: '9', name: 'Pregnenolona', category: 'medicamento', unit: 'g', currentQuantity: 60, minStock: 20, maxStock: 150, costPrice: 55.00, sellPrice: 110.00, avgDailyConsumption: 0.8, daysUntilStockout: 75 },
  { id: '10', name: 'Anastrozol', category: 'medicamento', unit: 'g', currentQuantity: 25, minStock: 10, maxStock: 60, costPrice: 85.00, sellPrice: 170.00, avgDailyConsumption: 0.3, daysUntilStockout: 83 },

  // Materiais
  { id: '11', name: 'Trocarte 10G (Implante)', category: 'material', unit: 'un', currentQuantity: 150, minStock: 50, maxStock: 500, costPrice: 8.50, sellPrice: 15.00, avgDailyConsumption: 4.0, daysUntilStockout: 37 },
  { id: '12', name: 'Trocarte 8G (Implante)', category: 'material', unit: 'un', currentQuantity: 85, minStock: 30, maxStock: 300, costPrice: 9.00, sellPrice: 16.00, avgDailyConsumption: 2.5, daysUntilStockout: 34 },
  { id: '13', name: 'Agulha Hipodérmica 40x12', category: 'material', unit: 'un', currentQuantity: 500, minStock: 100, maxStock: 2000, costPrice: 0.35, sellPrice: 0.80, avgDailyConsumption: 12.0, daysUntilStockout: 42 },
  { id: '14', name: 'Luva Procedimento M', category: 'material', unit: 'cx', currentQuantity: 8, minStock: 10, maxStock: 50, costPrice: 28.00, sellPrice: 45.00, avgDailyConsumption: 1.5, daysUntilStockout: 5 },
  { id: '15', name: 'Lidocaína 2% s/ Vaso', category: 'medicamento', unit: 'amp', currentQuantity: 0, minStock: 20, maxStock: 100, costPrice: 4.50, sellPrice: 12.00, avgDailyConsumption: 3.0, daysUntilStockout: 0 },

  // Cosméticos / Soroterapia
  { id: '16', name: 'Vitamina C Injetável (500mg/ml)', category: 'medicamento', unit: 'amp', currentQuantity: 40, minStock: 20, maxStock: 100, costPrice: 12.00, sellPrice: 35.00, avgDailyConsumption: 2.0, daysUntilStockout: 20 },
  { id: '17', name: 'Complexo B Injetável', category: 'medicamento', unit: 'amp', currentQuantity: 55, minStock: 15, maxStock: 80, costPrice: 8.00, sellPrice: 22.00, avgDailyConsumption: 1.0, daysUntilStockout: 55 },
  { id: '18', name: 'Clorexidina Alcoólica 0,5%', category: 'cosmético', unit: 'L', currentQuantity: 5, minStock: 3, maxStock: 15, costPrice: 22.00, sellPrice: 40.00, avgDailyConsumption: 0.2, daysUntilStockout: 25 },
  { id: '19', name: 'Curativo Tegaderm 6x7', category: 'material', unit: 'un', currentQuantity: 200, minStock: 50, maxStock: 500, costPrice: 3.80, sellPrice: 8.00, avgDailyConsumption: 5.0, daysUntilStockout: 40 },
  { id: '20', name: 'Zinco Quelato Injetável', category: 'medicamento', unit: 'amp', currentQuantity: 30, minStock: 10, maxStock: 60, costPrice: 15.00, sellPrice: 40.00, avgDailyConsumption: 0.8, daysUntilStockout: 37 },
];

const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Eli Lilly Brasil', deliveryDays: 3, pricePerUnit: 1950.00, contact: '(11) 3568-8000' },
  { id: 's2', name: 'Farmácia Express Manipulação', deliveryDays: 2, pricePerUnit: 42.00, contact: '(11) 99001-1223' },
  { id: 's3', name: 'Distribuidora Médica SP', deliveryDays: 5, pricePerUnit: 38.00, contact: '(11) 98877-6655' },
  { id: 's4', name: 'MedSupply Brasil', deliveryDays: 7, pricePerUnit: 32.00, contact: '(11) 97766-5544' },
];

type TabFilter = 'all' | 'critical' | 'medicamento' | 'material' | 'cosmético';

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [showReorderPanel, setShowReorderPanel] = useState(false);
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

  // Filter & Search
  const filteredItems = useMemo(() => {
    let filtered = items;
    if (activeTab === 'critical') {
      filtered = filtered.filter(item => (item.daysUntilStockout ?? 999) <= 14 || item.currentQuantity <= item.minStock);
    } else if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.category === activeTab);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(s) ||
        item.genericName?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [items, activeTab, search]);

  // Computed stats
  const criticalItems = items.filter(item => (item.daysUntilStockout ?? 999) <= 7 && item.currentQuantity > 0);
  const totalStockPercent = useMemo(() => {
    const totalCurrent = items.reduce((sum, item) => sum + item.currentQuantity, 0);
    const totalMax = items.reduce((sum, item) => sum + (item.maxStock || item.currentQuantity * 2), 0);
    return totalMax > 0 ? Math.round((totalCurrent / totalMax) * 100) : 0;
  }, [items]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicamento': return <Pill className="w-4 h-4" />;
      case 'material': return <Box className="w-4 h-4" />;
      case 'cosmético': return <Droplet className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentQuantity <= 0) return { label: 'Esgotado', style: 'border-destructive/40 text-destructive bg-destructive/5' };
    if (item.currentQuantity <= item.minStock * 0.5) return { label: 'Crítico', style: 'border-destructive/30 text-destructive' };
    if (item.currentQuantity <= item.minStock) return { label: 'Baixo', style: 'border-warning/30 text-warning' };
    return { label: 'OK', style: 'border-foreground/20 text-foreground/60' };
  };

  const getStockBarColor = (item: InventoryItem) => {
    const pct = item.maxStock ? (item.currentQuantity / item.maxStock) * 100 : 50;
    if (pct <= 15) return 'bg-destructive';
    if (pct <= 35) return 'bg-warning';
    return 'bg-foreground/40';
  };

  const gaugeOffset = 339.292 - (339.292 * totalStockPercent) / 100;
  const gaugeColor = totalStockPercent > 60 ? 'stroke-foreground' : totalStockPercent > 30 ? 'stroke-warning' : 'stroke-destructive';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants = {
    hidden: { y: 4, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.15 } },
  };

  const tabs: { id: TabFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'critical', label: `Críticos (${items.filter(i => (i.daysUntilStockout ?? 999) <= 14 || i.currentQuantity <= i.minStock).length})` },
    { id: 'medicamento', label: 'Medicamentos' },
    { id: 'material', label: 'Materiais' },
    { id: 'cosmético', label: 'Cosméticos' },
  ];

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Estoque & Componentes</h1>
            <p className="font-mono text-sm text-muted-foreground">Gestão de produtos, insumos e previsão de abastecimento</p>
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
            <button className="h-9 px-4 bg-foreground hover:bg-foreground/90 text-background font-mono text-xs uppercase tracking-[0.15em] border-0 transition-colors duration-150 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Novo Produto
            </button>
          </div>
        </motion.div>

        {/* Top Row: Gauge + Stats + Critical Alert */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Stock Gauge */}
          <div className="lg:col-span-3 border border-border glass-card-solid p-6 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-3">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-border" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  className={gaugeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="339.292"
                  strokeDashoffset={gaugeOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-bold text-foreground">{totalStockPercent}%</span>
                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Estoque</span>
              </div>
            </div>
            <p className="font-mono text-xs text-muted-foreground text-center">
              {items.length} produtos cadastrados
            </p>
          </div>

          {/* Summary Stats */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <StatCard icon={<Package className="w-4 h-4" />} label="Valor Total" value={`R$ ${(summary.totalValue / 1000).toFixed(1)}k`} subtext={`${summary.totalItems} itens`} />
            <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Estoque Baixo" value={summary.lowStockCount} subtext={`${summary.outOfStockCount} esgotado(s)`} />
            <StatCard icon={<ShieldAlert className="w-4 h-4" />} label="Vencendo (30d)" value={summary.expiringCount} subtext={`${summary.expiredCount} vencido(s)`} />
            <StatCard icon={<Bell className="w-4 h-4" />} label="Alertas Ativos" value={summary.criticalAlerts + summary.warningAlerts} subtext={`${summary.criticalAlerts} críticos`} />
          </div>

          {/* Critical Alerts Preview */}
          <div className="lg:col-span-4 border border-border glass-card-solid p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Reposição Urgente
              </h3>
              <button
                onClick={() => setShowReorderPanel(!showReorderPanel)}
                className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                {showReorderPanel ? 'Ocultar' : 'Ver Todos'}
              </button>
            </div>

            {criticalItems.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground text-center py-4">Nenhum item em nível crítico</p>
            ) : (
              <div className="space-y-2.5">
                {criticalItems.slice(0, 4).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 border border-destructive/15 bg-destructive/[0.03] group hover:border-destructive/30 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="text-destructive/60">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-xs font-semibold text-foreground truncate">{item.name}</p>
                        <p className="font-mono text-[9px] text-muted-foreground">{item.currentQuantity} {item.unit} restante</p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-destructive whitespace-nowrap ml-2">
                      {item.daysUntilStockout}d
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Supplier Recommendation (inline) */}
            {criticalItems.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-3 h-3" /> Fornecedor Recomendado
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-xs font-semibold text-foreground">{mockSuppliers[0].name}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">Entrega em {mockSuppliers[0].deliveryDays} dias • {mockSuppliers[0].contact}</p>
                  </div>
                  <button className="font-mono text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 border border-foreground/20 text-foreground hover:border-foreground/40 transition-colors">
                    Pedir
                  </button>
                </div>
              </div>
            )}
          </div>
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
          <Link href="/estoque/lotes">
            <button className="h-9 px-4 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors duration-150 flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Lotes
            </button>
          </Link>
          <Link href="/estoque/produtos">
            <button className="h-9 px-4 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors duration-150 flex items-center gap-2">
              <Box className="w-3.5 h-3.5" /> Produtos
            </button>
          </Link>
        </motion.div>

        {/* Tabs + Search */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'border-foreground/40 text-foreground bg-foreground/[0.05]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-foreground/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Items Table */}
        <motion.div variants={itemVariants} className="border border-border glass-card-solid">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">
              Produtos em Estoque
              <span className="font-mono text-xs text-muted-foreground ml-2 font-normal">
                ({filteredItems.length} de {items.length})
              </span>
            </h2>
          </div>

          {loadingItems ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-mono text-sm text-muted-foreground">
                {items.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-6 mono-label text-muted-foreground">Produto</th>
                    <th className="text-left py-3 px-4 mono-label text-muted-foreground">Cat.</th>
                    <th className="text-left py-3 px-4 mono-label text-muted-foreground w-40">Nível</th>
                    <th className="text-right py-3 px-4 mono-label text-muted-foreground">Qtd</th>
                    <th className="text-right py-3 px-4 mono-label text-muted-foreground">Custo</th>
                    <th className="text-center py-3 px-4 mono-label text-muted-foreground">Dias Rest.</th>
                    <th className="text-center py-3 px-6 mono-label text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = getStockStatus(item);
                    const pct = item.maxStock ? Math.min((item.currentQuantity / item.maxStock) * 100, 100) : 50;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-150 cursor-pointer group"
                      >
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="text-foreground/60 group-hover:text-foreground transition-colors">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div>
                              <span className="font-serif font-semibold text-foreground text-sm group-hover:text-foreground transition-colors block">
                                {item.name}
                              </span>
                              {item.supplier && (
                                <span className="font-mono text-[9px] text-muted-foreground">{item.supplier}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground capitalize">{item.category}</td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-border/50 h-1.5">
                            <div
                              className={`h-full transition-all duration-500 ${getStockBarColor(item)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm font-medium text-foreground">
                          {item.currentQuantity} <span className="text-muted-foreground text-[10px]">{item.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">
                          R$ {(item.costPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono text-xs font-medium ${
                            (item.daysUntilStockout ?? 999) <= 7 ? 'text-destructive' :
                            (item.daysUntilStockout ?? 999) <= 14 ? 'text-warning' :
                            'text-muted-foreground'
                          }`}>
                            {item.daysUntilStockout === 0 ? '—' : `${item.daysUntilStockout}d`}
                          </span>
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

        {/* Reorder Panel (Expandable) */}
        <AnimatePresence>
          {showReorderPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border border-border glass-card-solid p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Recomendação de Pedidos
                  </h3>
                  <button onClick={() => setShowReorderPanel(false)} className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground/40 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockSuppliers.map(supplier => (
                    <div key={supplier.id} className="p-4 border border-border hover:border-foreground/30 transition-colors">
                      <p className="font-serif text-sm font-bold text-foreground mb-1">{supplier.name}</p>
                      <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                        <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Entrega em {supplier.deliveryDays} dias</p>
                        <p className="flex items-center gap-1.5"><Package className="w-3 h-3" /> R$ {supplier.pricePerUnit.toFixed(2)}/un</p>
                      </div>
                      <button className="mt-3 w-full font-mono text-[9px] uppercase tracking-[0.15em] py-1.5 border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors">
                        Solicitar Cotação
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
    <div className="border border-border glass-card-solid p-5 hover:border-foreground/30 transition-colors duration-150">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-2xl font-medium text-foreground mb-1 tracking-tight">
            {value}
          </p>
          <p className="mono-label text-muted-foreground">{label}</p>
          {subtext && (
            <p className="font-mono text-[10px] text-muted-foreground mt-1.5">
              {subtext}
            </p>
          )}
        </div>
        <div className="text-foreground/60">
          {icon}
        </div>
      </div>
    </div>
  );
}
