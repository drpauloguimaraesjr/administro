'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Syringe, Clock, CheckCircle2, XCircle, ShoppingCart,
  CalendarCheck, Plus, Search, RefreshCw, Users,
  Package, ChevronRight, FileText, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { ApplicationOrder, ApplicationSummary } from '@/types/application';

type StatusFilter = 'all' | 'prescribed' | 'waiting_purchase' | 'purchased' | 'scheduled' | 'administered' | 'cancelled';

const STATUS_CONFIG = {
  prescribed: {
    label: 'Prescrito',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: FileText,
    dotColor: 'bg-blue-400',
  },
  waiting_purchase: {
    label: 'Aguardando Compra',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: ShoppingCart,
    dotColor: 'bg-amber-400',
  },
  purchased: {
    label: 'Comprado',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-400',
  },
  scheduled: {
    label: 'Agendado',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: CalendarCheck,
    dotColor: 'bg-purple-400',
  },
  administered: {
    label: 'Aplicado',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Syringe,
    dotColor: 'bg-cyan-400',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
    dotColor: 'bg-red-400',
  },
};

const PRIORITY_CONFIG = {
  routine: { label: 'Rotina', color: 'text-[#918a82]' },
  urgent: { label: 'Urgente', color: 'text-amber-400' },
  stat: { label: 'STAT', color: 'text-red-400 font-bold' },
};

export default function AplicacoesPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['applications-summary'],
    queryFn: async () => {
      const response = await api.get('/applications/summary');
      return response.data as ApplicationSummary;
    }
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['applications', activeFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (activeFilter !== 'all') params.status = activeFilter;
      const response = await api.get('/applications', { params });
      return response.data as ApplicationOrder[];
    }
  });

  // Mutations for quick actions
  const purchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/applications/${id}/purchase`, {
        confirmedBy: 'Recepção',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications-summary'] });
      toast.success('Compra confirmada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao confirmar compra');
    }
  });

  const administerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/applications/${id}/administer`, {
        administeredBy: 'Enfermagem',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications-summary'] });
      toast.success('Aplicação registrada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao registrar aplicação');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/applications/${id}/cancel`, {
        cancelledBy: 'Usuário',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications-summary'] });
      toast.success('Aplicação cancelada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao cancelar');
    }
  });

  const filteredOrders = orders?.filter(order =>
    order.patientName.toLowerCase().includes(search.toLowerCase()) ||
    order.productName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getNextAction = (order: ApplicationOrder) => {
    switch (order.status) {
      case 'prescribed':
        return { label: 'Aguardar Compra', action: () => purchaseMutation.mutate(order.id), icon: ShoppingCart };
      case 'waiting_purchase':
        return { label: 'Confirmar Compra', action: () => purchaseMutation.mutate(order.id), icon: CheckCircle2 };
      case 'purchased':
      case 'scheduled':
        return { label: 'Registrar Aplicação', action: () => administerMutation.mutate(order.id), icon: Syringe };
      default:
        return null;
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const summaryCards = [
    { label: 'Aguardando Compra', value: summary?.waitingPurchase || 0, icon: ShoppingCart, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    { label: 'Comprados', value: summary?.purchased || 0, icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    { label: 'Agendados', value: summary?.scheduled || 0, icon: CalendarCheck, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { label: 'Aplicados Hoje', value: summary?.todayApplications || 0, icon: Syringe, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  ];

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'prescribed', label: 'Prescritos' },
    { key: 'waiting_purchase', label: 'Aguardando' },
    { key: 'purchased', label: 'Comprados' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'administered', label: 'Aplicados' },
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Aplicações
            </h1>
            <p className="text-muted-foreground/70 mt-1">Injetáveis — compra e aplicação</p>
          </div>
          <div className="flex gap-3">
            <Link href="/aplicacoes/produtos">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
                <Package className="w-4 h-4 mr-2" />
                Por Produto
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Aplicação
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-foreground/90/50 border-border backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground/70 text-sm">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bgColor}`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterTabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeFilter === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(tab.key)}
              className={
                activeFilter === tab.key
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  : 'border-slate-600 hover:bg-slate-700'
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-5 h-5" />
          <Input
            placeholder="Buscar por paciente ou produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-foreground/90/50 border-border text-white placeholder:text-muted-foreground"
          />
        </div>

        {/* Orders List */}
        <Card className="bg-foreground/90/50 border-border backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Syringe className="w-5 h-5 text-cyan-400" />
              Pedidos de Aplicação
              {orders && <Badge variant="outline" className="ml-2">{filteredOrders.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground/70">
                <Syringe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{orders?.length === 0 ? 'Nenhuma aplicação registrada' : 'Nenhum resultado encontrado'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => {
                    const statusConfig = STATUS_CONFIG[order.status];
                    const StatusIcon = statusConfig.icon;
                    const priorityConfig = PRIORITY_CONFIG[order.priority];
                    const nextAction = getNextAction(order);

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-slate-700/30 transition-all group"
                      >
                        {/* Status Indicator */}
                        <div className={`p-2.5 rounded-lg ${statusConfig.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white truncate">
                              {order.productName}
                            </span>
                            {order.productDetails && (
                              <span className="text-muted-foreground/70 text-sm truncate">
                                {order.productDetails}
                              </span>
                            )}
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            {order.priority !== 'routine' && (
                              <span className={`text-xs ${priorityConfig.color}`}>
                                {priorityConfig.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                            <Link
                              href={`/aplicacoes/paciente/${order.patientId}`}
                              className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                            >
                              <Users className="w-3.5 h-3.5" />
                              {order.patientName}
                            </Link>
                            <span>{order.quantity} {order.unit} — {order.route}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(order.createdAt)}
                            </span>
                            {order.batchNumber && (
                              <span className="text-emerald-400/70">
                                Lote: {order.batchNumber}
                              </span>
                            )}
                            {order.administeredBy && (
                              <span className="text-cyan-400/70">
                                Por: {order.administeredBy}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {nextAction && (
                            <Button
                              size="sm"
                              onClick={nextAction.action}
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                              disabled={purchaseMutation.isPending || administerMutation.isPending}
                            >
                              <nextAction.icon className="w-4 h-4 mr-1" />
                              {nextAction.label}
                            </Button>
                          )}
                          {order.status !== 'administered' && order.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelMutation.mutate(order.id)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
