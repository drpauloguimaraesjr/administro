'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, AlertTriangle, Plus, Search,
  RefreshCw, Box, Pill, Droplet, ShieldAlert, Bell, TrendingUp,
  TrendingDown, Truck, Clock, X, ArrowLeft, BarChart3,
  Calendar as CalendarIcon
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, ComposedChart
} from 'recharts';

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

// ─── SPARKLINE DATA GENERATOR ───
function generateSparklineData(item: InventoryItem, days: number = 15) {
  const data: { day: number; stock: number; consumption: number }[] = [];
  const avgConsumption = item.avgDailyConsumption || 1;
  const maxStock = item.maxStock || item.currentQuantity * 2;
  let stock = Math.min(item.currentQuantity + avgConsumption * days * 0.8, maxStock);

  for (let i = 0; i < days; i++) {
    const dailyVariation = 0.5 + Math.random() * 1.0;
    const consumption = Math.max(0, avgConsumption * dailyVariation);
    stock = Math.max(0, stock - consumption);
    data.push({
      day: i + 1,
      stock: Math.round(stock * 10) / 10,
      consumption: Math.round(consumption * 10) / 10,
    });
  }
  return data;
}

// ─── DETAIL CHART DATA GENERATOR ───
function generateDetailData(item: InventoryItem, periodDays: number) {
  const today = new Date();
  const historyData: { date: string; stock: number; consumption: number; label: string }[] = [];
  const projectionData: { date: string; stock: number; projected: number; criticalLevel: number; label: string }[] = [];

  const avgConsumption = item.avgDailyConsumption || 1;
  const maxStock = item.maxStock || item.currentQuantity * 2;

  // History (past periodDays)
  let histStock = Math.min(item.currentQuantity + avgConsumption * periodDays * 0.7, maxStock);
  for (let i = periodDays; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const variation = 0.4 + Math.random() * 1.2;
    const consumed = avgConsumption * variation;
    histStock = Math.max(0, histStock - consumed);
    const dateLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    historyData.push({
      date: dateLabel,
      stock: Math.round(histStock * 10) / 10,
      consumption: Math.round(consumed * 10) / 10,
      label: dateLabel,
    });
  }

  // Projection (next 30 days)
  let projStock = item.currentQuantity;
  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    projectionData.push({
      date: dateLabel,
      stock: i === 0 ? item.currentQuantity : 0,
      projected: Math.round(Math.max(0, projStock) * 10) / 10,
      criticalLevel: item.minStock,
      label: dateLabel,
    });
    projStock -= avgConsumption * (0.7 + Math.random() * 0.6);
  }

  // Consumption bars (last periodDays grouped by 3-day periods)
  const consumptionBars: { period: string; amount: number }[] = [];
  const groupSize = periodDays <= 15 ? 3 : 5;
  for (let i = 0; i < historyData.length; i += groupSize) {
    const slice = historyData.slice(i, i + groupSize);
    const total = slice.reduce((s, d) => s + d.consumption, 0);
    consumptionBars.push({
      period: slice[0]?.date || '',
      amount: Math.round(total * 10) / 10,
    });
  }

  return { historyData, projectionData, consumptionBars };
}

// ─── MOCK DATA ───
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
  { id: '1', name: 'Tirzepatida 2.5mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 8, minStock: 10, maxStock: 40, costPrice: 1850.00, sellPrice: 2800.00, avgDailyConsumption: 1.2, daysUntilStockout: 7, lastRestock: '2026-02-28', supplier: 'Eli Lilly Brasil' },
  { id: '2', name: 'Tirzepatida 5mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 15, minStock: 10, maxStock: 40, costPrice: 1950.00, sellPrice: 3000.00, avgDailyConsumption: 0.8, daysUntilStockout: 19, lastRestock: '2026-03-01', supplier: 'Eli Lilly Brasil' },
  { id: '3', name: 'Tirzepatida 7.5mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 6, minStock: 8, maxStock: 30, costPrice: 2100.00, sellPrice: 3200.00, avgDailyConsumption: 0.5, daysUntilStockout: 12, lastRestock: '2026-02-20', supplier: 'Eli Lilly Brasil' },
  { id: '4', name: 'Tirzepatida 10mg (Mounjaro)', genericName: 'Tirzepatida', category: 'medicamento', unit: 'caneta', currentQuantity: 3, minStock: 5, maxStock: 20, costPrice: 2250.00, sellPrice: 3400.00, avgDailyConsumption: 0.3, daysUntilStockout: 10, lastRestock: '2026-02-15', supplier: 'Eli Lilly Brasil' },
  { id: '5', name: 'Testosterona Base Micronizada', genericName: 'Testosterona', category: 'medicamento', unit: 'g', currentQuantity: 180, minStock: 50, maxStock: 500, costPrice: 42.00, sellPrice: 85.00, avgDailyConsumption: 8.5, daysUntilStockout: 21, lastRestock: '2026-03-05' },
  { id: '6', name: 'Gestrinona', category: 'medicamento', unit: 'g', currentQuantity: 45, minStock: 30, maxStock: 200, costPrice: 95.00, sellPrice: 190.00, avgDailyConsumption: 3.2, daysUntilStockout: 14, lastRestock: '2026-02-25' },
  { id: '7', name: 'Oxandrolona', category: 'medicamento', unit: 'g', currentQuantity: 12, minStock: 25, maxStock: 150, costPrice: 120.00, sellPrice: 250.00, avgDailyConsumption: 2.0, daysUntilStockout: 6, lastRestock: '2026-02-18' },
  { id: '8', name: 'DHEA', category: 'medicamento', unit: 'g', currentQuantity: 90, minStock: 40, maxStock: 200, costPrice: 38.00, sellPrice: 75.00, avgDailyConsumption: 1.5, daysUntilStockout: 60, lastRestock: '2026-03-02' },
  { id: '9', name: 'Pregnenolona', category: 'medicamento', unit: 'g', currentQuantity: 60, minStock: 20, maxStock: 150, costPrice: 55.00, sellPrice: 110.00, avgDailyConsumption: 0.8, daysUntilStockout: 75 },
  { id: '10', name: 'Anastrozol', category: 'medicamento', unit: 'g', currentQuantity: 25, minStock: 10, maxStock: 60, costPrice: 85.00, sellPrice: 170.00, avgDailyConsumption: 0.3, daysUntilStockout: 83 },
  { id: '11', name: 'Trocarte 10G (Implante)', category: 'material', unit: 'un', currentQuantity: 150, minStock: 50, maxStock: 500, costPrice: 8.50, sellPrice: 15.00, avgDailyConsumption: 4.0, daysUntilStockout: 37 },
  { id: '12', name: 'Trocarte 8G (Implante)', category: 'material', unit: 'un', currentQuantity: 85, minStock: 30, maxStock: 300, costPrice: 9.00, sellPrice: 16.00, avgDailyConsumption: 2.5, daysUntilStockout: 34 },
  { id: '13', name: 'Agulha Hipodérmica 40x12', category: 'material', unit: 'un', currentQuantity: 500, minStock: 100, maxStock: 2000, costPrice: 0.35, sellPrice: 0.80, avgDailyConsumption: 12.0, daysUntilStockout: 42 },
  { id: '14', name: 'Luva Procedimento M', category: 'material', unit: 'cx', currentQuantity: 8, minStock: 10, maxStock: 50, costPrice: 28.00, sellPrice: 45.00, avgDailyConsumption: 1.5, daysUntilStockout: 5 },
  { id: '15', name: 'Lidocaína 2% s/ Vaso', category: 'medicamento', unit: 'amp', currentQuantity: 0, minStock: 20, maxStock: 100, costPrice: 4.50, sellPrice: 12.00, avgDailyConsumption: 3.0, daysUntilStockout: 0 },
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

// ─── MINI SPARKLINE COMPONENT ───
function MiniSparkline({ item }: { item: InventoryItem }) {
  const data = useMemo(() => generateSparklineData(item, 15), [item]);
  const maxStock = Math.max(...data.map(d => d.stock), 1);
  const maxConsumption = Math.max(...data.map(d => d.consumption), 1);
  const daysLeft = item.daysUntilStockout ?? 999;
  const consumptionColor = daysLeft <= 7 ? '#ef4444' : daysLeft <= 14 ? 'hsl(var(--warning))' : '#22c55e';

  const w = 80;
  const h = 24;

  const stockPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.stock / maxStock) * h * 0.85;
    return `${x},${y}`;
  }).join(' ');

  const consumptionPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.consumption / maxConsumption) * h * 0.6 - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {/* Stock decline line */}
      <polyline
        points={stockPoints}
        fill="none"
        stroke="currentColor"
        className="text-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Consumption curve */}
      <polyline
        points={consumptionPoints}
        fill="none"
        stroke={consumptionColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2,2"
        opacity="0.7"
      />
    </svg>
  );
}

// ─── DETAIL MODAL ───
function ItemDetailModal({
  item,
  onClose,
  suppliers,
}: {
  item: InventoryItem;
  onClose: () => void;
  suppliers: Supplier[];
}) {
  const [detailPeriod, setDetailPeriod] = useState<number>(30);
  const { historyData, projectionData, consumptionBars } = useMemo(
    () => generateDetailData(item, detailPeriod),
    [item, detailPeriod]
  );

  const daysLeft = item.daysUntilStockout ?? 999;
  const statusColor = daysLeft <= 7 ? 'text-destructive' : daysLeft <= 14 ? 'text-warning' : 'text-foreground';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-background border border-border w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground/40 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">{item.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xs text-muted-foreground capitalize">{item.category}</span>
                {item.supplier && (
                  <>
                    <span className="text-border">•</span>
                    <span className="font-mono text-xs text-muted-foreground">{item.supplier}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground/40 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Row */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-border">
          <div className="glass-card-solid border border-border p-4">
            <p className="font-mono text-2xl font-bold text-foreground">{item.currentQuantity} <span className="text-sm text-muted-foreground">{item.unit}</span></p>
            <p className="mono-label text-muted-foreground">Estoque Atual</p>
          </div>
          <div className="glass-card-solid border border-border p-4">
            <p className={`font-mono text-2xl font-bold ${statusColor}`}>{daysLeft > 0 ? `${daysLeft}d` : 'Esgotado'}</p>
            <p className="mono-label text-muted-foreground">Dias de Estoque</p>
          </div>
          <div className="glass-card-solid border border-border p-4">
            <p className="font-mono text-2xl font-bold text-foreground">{item.avgDailyConsumption || 0}</p>
            <p className="mono-label text-muted-foreground">{item.unit}/dia (média)</p>
          </div>
          <div className="glass-card-solid border border-border p-4">
            <p className="font-mono text-2xl font-bold text-foreground">{item.minStock} <span className="text-sm text-muted-foreground">{item.unit}</span></p>
            <p className="mono-label text-muted-foreground">Nível Crítico</p>
          </div>
        </div>

        {/* Charts */}
        <div className="px-6 py-6">
          {/* Period Selector */}
          <div className="flex items-center justify-end mb-4 gap-2">
            {[15, 30, 60].map(p => (
              <button
                key={p}
                onClick={() => setDetailPeriod(p)}
                className={`font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors ${
                  detailPeriod === p
                    ? 'border-foreground/40 text-foreground bg-foreground/[0.05]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {p} dias
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projeção de Estoque */}
            <div className="border border-border glass-card-solid p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Projeção de Estoque</h3>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-foreground/60" /> Histórico
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-warning" /> Projeção
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
                    <span className="w-2 h-0.5 bg-destructive" /> Nível Crítico
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={[...historyData.slice(-10), ...projectionData.slice(1)]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v} ${item.unit}`} width={60} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', fontFamily: 'monospace', fontSize: 11 }}
                    labelStyle={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                  />
                  <ReferenceLine y={item.minStock} stroke="hsl(var(--destructive))" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'Nível Crítico', position: 'right', fontSize: 9, fill: 'hsl(var(--destructive))' }} />
                  <Area dataKey="stock" fill="hsl(var(--foreground))" fillOpacity={0.06} stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} name="Histórico" />
                  <Line dataKey="projected" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Projeção" connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Consumo por Período */}
            <div className="border border-border glass-card-solid p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Consumo por Período</h3>
                <span className="font-mono text-[9px] text-muted-foreground">Últimos {detailPeriod} dias</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={consumptionBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="period" tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v} ${item.unit}`} width={60} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', fontFamily: 'monospace', fontSize: 11 }}
                    labelStyle={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--foreground))" fillOpacity={0.25} stroke="hsl(var(--foreground))" strokeWidth={1} radius={[2, 2, 0, 0]} name="Consumido" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row: Actions + Suppliers */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ações Rápidas */}
          <div className="border border-border glass-card-solid p-5">
            <h3 className="font-serif text-base font-bold text-foreground mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full py-2.5 bg-foreground hover:bg-foreground/90 text-background font-mono text-xs uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2">
                <Plus className="w-3.5 h-3.5" /> Entrada de Estoque
              </button>
              <button className="w-full py-2.5 border border-border text-foreground font-mono text-xs uppercase tracking-[0.15em] hover:border-foreground/40 transition-colors flex items-center justify-center gap-2">
                <TrendingDown className="w-3.5 h-3.5" /> Registrar Saída
              </button>
            </div>
          </div>

          {/* Recomendação de Pedido */}
          <div className="border border-border glass-card-solid p-5">
            <h3 className="font-serif text-base font-bold text-foreground mb-4">Recomendação de Pedido</h3>
            <div className="space-y-3">
              {suppliers.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 border border-border hover:border-foreground/30 transition-colors">
                  <div>
                    <p className="font-serif text-xs font-semibold text-foreground">{s.name}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      Entrega em {s.deliveryDays} dias • R$ {s.pricePerUnit.toFixed(2)}/{item.unit}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-warning font-medium">
                    Pedir até
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ───
export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [showReorderPanel, setShowReorderPanel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
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

  const criticalItems = items.filter(item => (item.daysUntilStockout ?? 999) <= 7 && item.currentQuantity > 0);

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

        {/* Top Row: Stats + Critical Alert */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Estoque Baixo" value={summary.lowStockCount} subtext={`${summary.outOfStockCount} esgotado(s)`} />
            <StatCard icon={<ShieldAlert className="w-4 h-4" />} label="Vencendo (30d)" value={summary.expiringCount} subtext={`${summary.expiredCount} vencido(s)`} />
            <StatCard icon={<Bell className="w-4 h-4" />} label="Alertas Ativos" value={summary.criticalAlerts + summary.warningAlerts} subtext={`${summary.criticalAlerts} críticos`} />
          </div>

          {/* Critical Alerts Preview */}
          <div className="lg:col-span-7 border border-border glass-card-solid p-5">
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
                  <div key={item.id} className="flex items-center justify-between p-2.5 border border-destructive/15 bg-destructive/[0.03] group hover:border-destructive/30 transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
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
                    <th className="text-left py-3 px-4 mono-label text-muted-foreground w-32">Nível</th>
                    <th className="text-center py-3 px-2 mono-label text-muted-foreground w-24">Tendência</th>
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
                        onClick={() => setSelectedItem(item)}
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
                        <td className="py-3 px-2 text-center">
                          <MiniSparkline item={item} />
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            suppliers={mockSuppliers}
          />
        )}
      </AnimatePresence>
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
