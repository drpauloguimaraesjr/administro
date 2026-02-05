'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Box,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { StockSummary, StockListItem, StockAlert } from '@/types/inventory';

export default function EstoquePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch summary
  const { data: summary, isLoading: loadingSummary } = useQuery<StockSummary>({
    queryKey: ['inventory-summary'],
    queryFn: async () => {
      const res = await api.get('/inventory/summary');
      return res.data;
    },
  });

  // Fetch stock list
  const { data: stockList = [], isLoading: loadingList } = useQuery<StockListItem[]>({
    queryKey: ['inventory-list'],
    queryFn: async () => {
      const res = await api.get('/inventory/list');
      return res.data;
    },
  });

  // Fetch alerts
  const { data: alerts = [] } = useQuery<StockAlert[]>({
    queryKey: ['inventory-alerts'],
    queryFn: async () => {
      const res = await api.get('/inventory/alerts');
      return res.data;
    },
  });

  // Filter stock list
  const filteredList = stockList.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: StockListItem['status']) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
      case 'low':
        return <Badge className="bg-yellow-100 text-yellow-700">Baixo</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Crítico</Badge>;
      case 'out':
        return <Badge className="bg-gray-100 text-gray-700">Esgotado</Badge>;
      default:
        return null;
    }
  };

  const getExpirationBadge = (days?: number) => {
    if (days === undefined) return null;
    if (days <= 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    if (days <= 15) {
      return <Badge className="bg-red-100 text-red-700">{days}d</Badge>;
    }
    if (days <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-700">{days}d</Badge>;
    }
    return <span className="text-gray-500 text-sm">{days}d</span>;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Controle de Estoque</h1>
            <p className="text-muted-foreground">
              Gerencie produtos, lotes e movimentações
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/estoque/produtos">
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Produtos
              </Button>
            </Link>
            <Link href="/estoque/lotes">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Entrada de Estoque
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total em Estoque
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingSummary ? '...' : formatCurrency(summary?.totalValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.totalProducts || 0} produtos • {summary?.totalBatches || 0} lotes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas Ativos
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingSummary ? '...' : (
                  (summary?.alertsCount.critical || 0) + 
                  (summary?.alertsCount.warning || 0)
                )}
              </div>
              <div className="flex gap-2 mt-1">
                {summary?.alertsCount.critical ? (
                  <Badge variant="destructive" className="text-xs">
                    {summary.alertsCount.critical} críticos
                  </Badge>
                ) : null}
                {summary?.alertsCount.warning ? (
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    {summary.alertsCount.warning} avisos
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {loadingSummary ? '...' : summary?.lowStockItems || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.outOfStockItems || 0} esgotados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vencendo este Mês
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loadingSummary ? '...' : summary?.expiringThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                lotes com validade próxima
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Alertas que Precisam de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      alert.severity === 'critical'
                        ? 'bg-red-100'
                        : alert.severity === 'warning'
                        ? 'bg-yellow-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {alert.severity === 'critical' ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Resolver
                    </Button>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <Link href="/estoque/alertas">
                    <Button variant="ghost" className="w-full">
                      Ver todos os {alerts.length} alertas
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Lista de Estoque</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produto..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ok">Normal</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="out">Esgotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="text-center py-8 text-gray-500">
                Carregando...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {stockList.length === 0 ? (
                  <>
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum produto cadastrado</p>
                    <Link href="/estoque/produtos">
                      <Button variant="link">Cadastrar primeiro produto</Button>
                    </Link>
                  </>
                ) : (
                  <p>Nenhum produto encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-center">Mínimo</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Validade</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Lotes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredList.map((item) => (
                      <TableRow key={item.productId} className="cursor-pointer hover:bg-gray-50">
                        <TableCell>
                          <Link href={`/estoque/produtos/${item.productId}`}>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {item.totalQuantity} {item.unit}
                          </span>
                          {item.totalQuantity !== item.availableQuantity && (
                            <span className="text-xs text-gray-500 block">
                              ({item.availableQuantity} disp.)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-gray-500">
                          {item.minStock} {item.unit}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.nearestExpiration ? (
                            <div className="flex flex-col items-center">
                              {getExpirationBadge(item.daysUntilExpiration)}
                              <span className="text-xs text-gray-400">
                                {new Date(item.nearestExpiration).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.totalValue)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.batchCount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/estoque/movimentacoes">
            <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowUpRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Movimentações</p>
                  <p className="text-xs text-gray-500">Histórico completo</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estoque/lotes">
            <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Box className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Lotes</p>
                  <p className="text-xs text-gray-500">Gerenciar lotes</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estoque/alertas">
            <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Alertas</p>
                  <p className="text-xs text-gray-500">
                    {alerts.length > 0 ? `${alerts.length} ativos` : 'Nenhum ativo'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/estoque/produtos">
            <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Produtos</p>
                  <p className="text-xs text-gray-500">Cadastro</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
