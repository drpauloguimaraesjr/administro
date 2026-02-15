'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Syringe, Clock, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, User, Package, ChevronRight, Timer, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';

interface NursingOrder {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  quantity: number;
  unit: string;
  route: string;
  instructions: string;
  status: 'pending' | 'preparing' | 'ready' | 'administered' | 'cancelled';
  priority: 'routine' | 'urgent' | 'stat';
  scheduledFor?: string;
  preparedBy?: string;
  preparedAt?: string;
  administeredBy?: string;
  administeredAt?: string;
  administrationNotes?: string;
  prescribedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface NursingOrderSummary {
  pending: number;
  preparing: number;
  ready: number;
  administered: number;
  cancelled: number;
  total: number;
}

type StatusFilter = 'all' | 'pending' | 'preparing' | 'ready' | 'administered' | 'cancelled';

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Clock,
    dotColor: 'bg-amber-400',
  },
  preparing: {
    label: 'Preparando',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Activity,
    dotColor: 'bg-blue-400',
  },
  ready: {
    label: 'Pronto',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-400',
  },
  administered: {
    label: 'Aplicado',
    color: 'bg-[#7c9a72]/20 text-[#a8c49e] border-[#7c9a72]/30',
    icon: Syringe,
    dotColor: 'bg-[#7c9a72]',
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

export default function EnfermagemPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['nursing-orders-today'],
    queryFn: async () => {
      const response = await api.get('/nursing-orders/today');
      return response.data as NursingOrder[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const { data: summary } = useQuery({
    queryKey: ['nursing-orders-summary'],
    queryFn: async () => {
      const response = await api.get('/nursing-orders/summary');
      return response.data as NursingOrderSummary;
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await api.put(`/nursing-orders/${id}/status`, {
        status,
        performedBy: 'Enfermagem',
        notes,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nursing-orders-today'] });
      queryClient.invalidateQueries({ queryKey: ['nursing-orders-summary'] });

      const statusLabels: Record<string, string> = {
        preparing: 'Em preparo',
        ready: 'Pronto para aplicação',
        administered: 'Aplicado com sucesso',
        cancelled: 'Cancelado',
      };
      toast.success(statusLabels[variables.status] || 'Status atualizado');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar status', {
        description: error.response?.data?.error || error.message,
      });
    },
  });

  const filteredOrders = orders?.filter(o => filter === 'all' || o.status === filter) || [];

  const getNextAction = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Iniciar Preparo', nextStatus: 'preparing', icon: Activity };
      case 'preparing': return { label: 'Marcar Pronto', nextStatus: 'ready', icon: CheckCircle2 };
      case 'ready': return { label: 'Registrar Aplicação', nextStatus: 'administered', icon: Syringe };
      default: return null;
    }
  };

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const summaryCards = [
    { key: 'pending', label: 'Pendentes', value: summary?.pending || 0, color: 'text-amber-400', bgColor: 'bg-amber-500/10', icon: Clock },
    { key: 'preparing', label: 'Preparando', value: summary?.preparing || 0, color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: Activity },
    { key: 'ready', label: 'Prontos', value: summary?.ready || 0, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', icon: CheckCircle2 },
    { key: 'administered', label: 'Aplicados', value: summary?.administered || 0, color: 'text-[#a8c49e]', bgColor: 'bg-[#7c9a72]/10', icon: Syringe },
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#f5f0eb] flex items-center gap-3">
              <Syringe className="w-8 h-8 text-[#7c9a72]" />
              Enfermagem
            </h1>
            <p className="text-[#918a82] mt-1 font-mono text-sm tracking-wide">
              Pedidos de administração — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['nursing-orders-today'] });
              queryClient.invalidateQueries({ queryKey: ['nursing-orders-summary'] });
            }}
            className="border-[#333] hover:bg-[#292929] text-[#d4cec8]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <button
                onClick={() => setFilter(filter === card.key as StatusFilter ? 'all' : card.key as StatusFilter)}
                className={`w-full text-left transition-all duration-200 rounded-lg border ${
                  filter === card.key
                    ? 'border-[#7c9a72] bg-[#7c9a72]/5'
                    : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#918a82] text-xs font-mono tracking-wide uppercase">{card.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all' as StatusFilter, label: 'Todos', count: orders?.length || 0 },
            { key: 'pending' as StatusFilter, label: 'Pendentes', count: summary?.pending || 0 },
            { key: 'preparing' as StatusFilter, label: 'Preparando', count: summary?.preparing || 0 },
            { key: 'ready' as StatusFilter, label: 'Prontos', count: summary?.ready || 0 },
            { key: 'administered' as StatusFilter, label: 'Aplicados', count: summary?.administered || 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-mono tracking-wide whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-[#7c9a72]/20 text-[#a8c49e] border border-[#7c9a72]/40'
                  : 'bg-[#1a1a1a] text-[#918a82] border border-[#333] hover:border-[#444] hover:text-[#d4cec8]'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 text-xs opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7c9a72]" />
            <span className="ml-3 text-[#918a82] font-mono text-sm">Carregando pedidos...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Syringe className="w-12 h-12 text-[#333] mx-auto mb-4" />
            <p className="text-[#918a82] font-mono text-sm">
              {filter === 'all' ? 'Nenhum pedido de administração hoje' : `Nenhum pedido com status "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label || filter}"`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, i) => {
                const statusConfig = STATUS_CONFIG[order.status];
                const priorityConfig = PRIORITY_CONFIG[order.priority];
                const nextAction = getNextAction(order.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedId === order.id;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="bg-[#1a1a1a] border-[#333] hover:border-[#444] transition-colors">
                      <CardContent className="p-0">
                        {/* Main Row */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="w-full text-left p-4 flex items-center gap-4"
                        >
                          {/* Status Dot */}
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusConfig.dotColor}`} />

                          {/* Patient & Product */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[#f5f0eb] font-medium text-sm truncate">
                                {order.patientName}
                              </span>
                              {order.priority !== 'routine' && (
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${priorityConfig.color}`}>
                                  {priorityConfig.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[#918a82] text-xs font-mono">
                              <Package className="w-3 h-3 shrink-0" />
                              <span className="truncate">{order.productName}</span>
                              <span className="text-[#555]">·</span>
                              <span>{order.quantity} {order.unit}</span>
                              <span className="text-[#555]">·</span>
                              <span className="text-[#a8c49e] font-medium">{order.route}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge className={`${statusConfig.color} border text-[10px] font-mono uppercase tracking-wider shrink-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>

                          {/* Time */}
                          <span className="text-[#555] text-xs font-mono shrink-0">
                            {formatTime(order.createdAt)}
                          </span>

                          <ChevronRight className={`w-4 h-4 text-[#555] transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0 border-t border-[#292929]">
                                <div className="pt-4 space-y-3">
                                  {/* Instructions */}
                                  {order.instructions && (
                                    <div>
                                      <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-1">Instruções</p>
                                      <p className="text-[#d4cec8] text-sm">{order.instructions}</p>
                                    </div>
                                  )}

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {order.batchNumber && (
                                      <div>
                                        <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-0.5">Lote</p>
                                        <p className="text-[#d4cec8] text-xs font-mono">{order.batchNumber}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-0.5">Prescrito por</p>
                                      <p className="text-[#d4cec8] text-xs">{order.prescribedBy}</p>
                                    </div>
                                    {order.preparedBy && (
                                      <div>
                                        <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-0.5">Preparado por</p>
                                        <p className="text-[#d4cec8] text-xs">{order.preparedBy}</p>
                                      </div>
                                    )}
                                    {order.administeredBy && (
                                      <div>
                                        <p className="text-[10px] font-mono text-[#555] uppercase tracking-wider mb-0.5">Aplicado por</p>
                                        <p className="text-[#d4cec8] text-xs">{order.administeredBy}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-2">
                                    {nextAction && (
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateStatusMutation.mutate({
                                            id: order.id,
                                            status: nextAction.nextStatus,
                                          });
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                        className="bg-[#7c9a72] hover:bg-[#6b8962] text-white text-xs font-mono"
                                      >
                                        <nextAction.icon className="w-3.5 h-3.5 mr-1.5" />
                                        {nextAction.label}
                                      </Button>
                                    )}

                                    {order.status !== 'administered' && order.status !== 'cancelled' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateStatusMutation.mutate({
                                            id: order.id,
                                            status: 'cancelled',
                                            notes: 'Cancelado pela enfermagem',
                                          });
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono"
                                      >
                                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Cancelar
                                      </Button>
                                    )}

                                    {order.status === 'cancelled' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateStatusMutation.mutate({
                                            id: order.id,
                                            status: 'pending',
                                          });
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                        className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-mono"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                        Reativar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
