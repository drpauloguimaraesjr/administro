'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import {
  StockSummary,
  StockListItem,
  StockMovement,
  StockAlert,
} from '@/types/inventory';
import { BillingSummary } from '@/types/billing';

// Simple chart components (without external lib)
const SimpleBarChart = ({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) => (
  <div className="space-y-3">
    {data.map((item, i) => (
      <div key={i} className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{item.label}</span>
          <span className="font-medium">{item.value}</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${item.color}`}
            style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const SimplePieChart = ({ data }: { data: { label: string; value: number; color: string; percent: number }[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {data.map((item, i) => {
          const angle = total > 0 ? (item.value / total) * 360 : 0;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 50 + 40 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
          const y2 = 50 + 40 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
          const largeArc = angle > 180 ? 1 : 0;
          
          if (angle === 0) return null;
          
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              className={item.color}
              fill="currentColor"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span>{item.label}</span>
            <span className="font-medium">({item.percent.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RelatoriosEstoquePage() {
  const [periodo, setPeriodo] = useState<string>('30');

  // Fetch data
  const { data: stockSummary } = useQuery<StockSummary>({
    queryKey: ['inventory-summary'],
    queryFn: async () => {
      const res = await api.get('/inventory/summary');
      return res.data;
    },
  });

  const { data: stockList = [] } = useQuery<StockListItem[]>({
    queryKey: ['inventory-list'],
    queryFn: async () => {
      const res = await api.get('/inventory/list');
      return res.data;
    },
  });

  const { data: movements = [] } = useQuery<StockMovement[]>({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const res = await api.get('/inventory/movements?limit=500');
      return res.data;
    },
  });

  const { data: alerts = [] } = useQuery<StockAlert[]>({
    queryKey: ['inventory-alerts'],
    queryFn: async () => {
      const res = await api.get('/inventory/alerts');
      return res.data;
    },
  });

  const { data: billingSummary } = useQuery<BillingSummary>({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      const res = await api.get('/billing/summary');
      return res.data;
    },
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const periodDays = parseInt(periodo);
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Filter movements by period
    const periodMovements = movements.filter(m => new Date(m.createdAt) >= periodStart);
    
    // Entries vs Exits
    const entries = periodMovements.filter(m => m.type === 'in');
    const exits = periodMovements.filter(m => m.type === 'out');
    
    const totalEntries = entries.reduce((sum, m) => sum + m.quantity, 0);
    const totalExits = exits.reduce((sum, m) => sum + m.quantity, 0);
    const entriesValue = entries.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const exitsValue = exits.reduce((sum, m) => sum + (m.totalCost || 0), 0);

    // Top consumed products
    const consumptionByProduct = exits.reduce((acc, m) => {
      if (!acc[m.productId]) {
        acc[m.productId] = { name: m.productName, quantity: 0, value: 0 };
      }
      acc[m.productId].quantity += m.quantity;
      acc[m.productId].value += m.totalCost || 0;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; value: number }>);

    const topConsumed = Object.values(consumptionByProduct)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Stock by status
    const stockByStatus = {
      ok: stockList.filter(s => s.status === 'ok').length,
      low: stockList.filter(s => s.status === 'low').length,
      critical: stockList.filter(s => s.status === 'critical').length,
      out: stockList.filter(s => s.status === 'out').length,
    };

    // Stock by category
    const stockByCategory = stockList.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0 };
      }
      acc[item.category].count++;
      acc[item.category].value += item.totalValue;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Expiring soon
    const expiringSoon = stockList.filter(s => 
      s.daysUntilExpiration !== undefined && 
      s.daysUntilExpiration > 0 && 
      s.daysUntilExpiration <= 30
    );

    return {
      totalEntries,
      totalExits,
      entriesValue,
      exitsValue,
      topConsumed,
      stockByStatus,
      stockByCategory,
      expiringSoon,
      periodMovements,
    };
  }, [movements, stockList, periodo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Prepare chart data
  const statusChartData = [
    { label: 'Normal', value: metrics.stockByStatus.ok, color: 'text-green-500', percent: 0 },
    { label: 'Baixo', value: metrics.stockByStatus.low, color: 'text-yellow-500', percent: 0 },
    { label: 'Crítico', value: metrics.stockByStatus.critical, color: 'text-red-500', percent: 0 },
    { label: 'Esgotado', value: metrics.stockByStatus.out, color: 'text-gray-400', percent: 0 },
  ];
  const totalStatus = statusChartData.reduce((sum, d) => sum + d.value, 0);
  statusChartData.forEach(d => d.percent = totalStatus > 0 ? (d.value / totalStatus) * 100 : 0);

  const categoryChartData = Object.entries(metrics.stockByCategory)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 6)
    .map(([label, data]) => ({
      label,
      value: data.value,
      color: 'bg-purple-500',
    }));
  const maxCategoryValue = Math.max(...categoryChartData.map(d => d.value), 1);

  const consumptionChartData = metrics.topConsumed.map((item, i) => ({
    label: item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name,
    value: item.quantity,
    color: ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][i],
  }));
  const maxConsumption = Math.max(...consumptionChartData.map(d => d.value), 1);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/estoque">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Relatórios de Estoque</h1>
              <p className="text-muted-foreground">
                Análises e métricas do seu estoque
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Valor em Estoque</p>
                  <p className="text-2xl font-bold">{formatCurrency(stockSummary?.totalValue || 0)}</p>
                  <p className="text-xs text-gray-500">{stockSummary?.totalProducts || 0} produtos</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Entradas ({periodo}d)</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.totalEntries}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(metrics.entriesValue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Saídas ({periodo}d)</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.totalExits}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(metrics.exitsValue)}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lucro Faturado</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(billingSummary?.totalProfit || 0)}</p>
                  <p className="text-xs text-gray-500">Margem: {billingSummary?.profitMargin?.toFixed(1) || 0}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5" />
                Status do Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimplePieChart data={statusChartData} />
            </CardContent>
          </Card>

          {/* Top Consumed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Mais Consumidos ({periodo}d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {consumptionChartData.length > 0 ? (
                <SimpleBarChart data={consumptionChartData} maxValue={maxConsumption} />
              ) : (
                <p className="text-center text-gray-500 py-8">Sem movimentações no período</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Value by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Valor por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <div className="space-y-3">
                  {categoryChartData.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{ width: `${(item.value / maxCategoryValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Sem dados</p>
              )}
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Vencendo em 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.expiringSoon.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {metrics.expiringSoon.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.totalQuantity} {item.unit}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">
                        {item.daysUntilExpiration}d
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhum item vencendo nos próximos 30 dias 🎉
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts Summary */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Alertas Ativos ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.slice(0, 6).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg ${
                      alert.severity === 'critical'
                        ? 'bg-red-50 border border-red-200'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
              {alerts.length > 6 && (
                <Link href="/estoque/alertas">
                  <Button variant="ghost" className="w-full mt-4">
                    Ver todos os {alerts.length} alertas
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Faturado (Pendente)</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatCurrency(billingSummary?.pendingAmount || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Faturado (Recebido)</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(billingSummary?.paidAmount || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Custo Total</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(billingSummary?.totalCost || 0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">Lucro Líquido</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(billingSummary?.totalProfit || 0)}
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            {billingSummary?.byPaymentMethod && billingSummary.byPaymentMethod.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Recebimentos por Forma de Pagamento</p>
                <div className="flex flex-wrap gap-3">
                  {billingSummary.byPaymentMethod.map((pm) => (
                    <div key={pm.method} className="px-4 py-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-500 capitalize">{pm.method}</p>
                      <p className="font-bold text-green-700">{formatCurrency(pm.amount)}</p>
                      <p className="text-xs text-gray-400">{pm.count} pagamentos</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
