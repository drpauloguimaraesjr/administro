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
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock,
    dotColor: 'bg-warning',
  },
  preparing: {
    label: 'Preparando',
    color: 'bg-info/10 text-info border-info/20',
    icon: Activity,
    dotColor: 'bg-info',
  },
  ready: {
    label: 'Pronto',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
    dotColor: 'bg-success',
  },
  administered: {
    label: 'Aplicado',
    color: 'bg-muted/30 text-muted-foreground border-border/50',
    icon: Syringe,
    dotColor: 'bg-muted-foreground',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle,
    dotColor: 'bg-destructive',
  },
};

const PRIORITY_CONFIG = {
  routine: { label: 'Rotina', color: 'text-muted-foreground' },
  urgent: { label: 'Urgente', color: 'text-warning' },
  stat: { label: 'STAT', color: 'text-destructive font-bold' },
};

// MOCK DATA
const now = new Date().toISOString();
const mockOrders: NursingOrder[] = [
  { id: 'n1', prescriptionId: 'rx1', patientId: 'p1', patientName: 'Fernanda Lopes', productId: 'prod1', productName: 'Gestrinona 20mg', quantity: 1, unit: 'implante', route: 'Subcutâneo', instructions: 'Região glútea superior esquerda. Assepsia com clorexidina alcoólica.', status: 'administered', priority: 'routine', prescribedBy: 'Dr. Paulo', preparedBy: 'Enfermeira Ana', administeredBy: 'Enfermeira Ana', batchNumber: 'LOT-2025-0847', createdAt: now, updatedAt: now },
  { id: 'n2', prescriptionId: 'rx2', patientId: 'p2', patientName: 'Juliana Rocha', productId: 'prod2', productName: 'Testosterona 50mg', quantity: 1, unit: 'implante', route: 'Subcutâneo', instructions: 'Braço esquerdo. Aguardar 15min pós-aplicação.', status: 'ready', priority: 'routine', prescribedBy: 'Dr. Paulo', preparedBy: 'Enfermeira Carla', batchNumber: 'LOT-2025-1293', createdAt: now, updatedAt: now },
  { id: 'n3', prescriptionId: 'rx3', patientId: 'p3', patientName: 'João da Silveira', productId: 'prod3', productName: 'Testosterona 75mg + Oxandrolona 10mg', quantity: 2, unit: 'implantes', route: 'Subcutâneo', instructions: 'Região abdominal. Combo hormonal.', status: 'preparing', priority: 'routine', prescribedBy: 'Dr. Paulo', preparedBy: 'Enfermeira Ana', batchNumber: 'LOT-2025-0991', createdAt: now, updatedAt: now },
  { id: 'n4', prescriptionId: 'rx4', patientId: 'p4', patientName: 'Patrícia Almeida', productId: 'prod4', productName: 'Oxandrolona 15mg', quantity: 1, unit: 'implante', route: 'Subcutâneo', instructions: 'Região glútea. Paciente com alergia a esparadrapo.', status: 'pending', priority: 'routine', prescribedBy: 'Dr. Paulo', createdAt: now, updatedAt: now },
  { id: 'n5', prescriptionId: 'rx5', patientId: 'p5', patientName: 'Roberto Lima', productId: 'prod5', productName: 'Testosterona 75mg', quantity: 1, unit: 'implante', route: 'Glúteo', instructions: 'Implante profundo. Usar trocarte 10G.', status: 'pending', priority: 'urgent', prescribedBy: 'Dr. Paulo', createdAt: now, updatedAt: now },
  { id: 'n6', prescriptionId: 'rx6', patientId: 'p6', patientName: 'Cláudia Dias', productId: 'prod6', productName: 'Gestrinona 10mg + Testosterona 25mg', quantity: 2, unit: 'implantes', route: 'Subcutâneo', instructions: 'Combo. Atenção à sequência de inserção.', status: 'pending', priority: 'routine', prescribedBy: 'Dr. Paulo', createdAt: now, updatedAt: now },
];

const mockSummary: NursingOrderSummary = { pending: 3, preparing: 1, ready: 1, administered: 1, cancelled: 0, total: 6 };

export default function EnfermagemPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: apiOrders, isLoading } = useQuery({
    queryKey: ['nursing-orders-today'],
    queryFn: async () => {
      try {
        const response = await api.get('/nursing-orders/today');
        return response.data as NursingOrder[];
      } catch { return []; }
    },
    refetchInterval: 30000,
  });

  const { data: apiSummary } = useQuery({
    queryKey: ['nursing-orders-summary'],
    queryFn: async () => {
      try {
        const response = await api.get('/nursing-orders/summary');
        return response.data as NursingOrderSummary;
      } catch { return null; }
    },
    refetchInterval: 30000,
  });

  const orders = (apiOrders && apiOrders.length > 0) ? apiOrders : mockOrders;
  const summary = apiSummary || mockSummary;

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
    { key: 'pending', label: 'Pendentes', value: summary?.pending || 0, color: 'text-warning', bgColor: 'bg-warning/10', icon: Clock },
    { key: 'preparing', label: 'Preparando', value: summary?.preparing || 0, color: 'text-info', bgColor: 'bg-info/10', icon: Activity },
    { key: 'ready', label: 'Prontos', value: summary?.ready || 0, color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle2 },
    { key: 'administered', label: 'Aplicados', value: summary?.administered || 0, color: 'text-muted-foreground', bgColor: 'bg-muted/20', icon: Syringe },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Syringe className="w-8 h-8 text-muted-foreground" />
              Enfermagem
            </h1>
            <p className="text-muted-foreground mt-1 font-mono text-sm tracking-wide">
              Pedidos de administração — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['nursing-orders-today'] });
              queryClient.invalidateQueries({ queryKey: ['nursing-orders-summary'] });
            }}
            className="border-border hover:bg-muted text-foreground transition-colors"
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
                className={`w-full text-left transition-all duration-200 glass-card-solid ${filter === card.key
                    ? 'ring-1 ring-ring/50 border-ring/30 bg-card'
                    : 'border-border bg-card/60 hover:border-ring/20'
                  }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs font-mono tracking-wide uppercase">{card.label}</p>
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
              className={`px-4 py-2 rounded-md text-sm font-mono tracking-wide whitespace-nowrap transition-all ${filter === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-transparent text-muted-foreground border border-border/50 hover:bg-muted/50 hover:text-foreground'
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
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground font-mono text-sm">Carregando pedidos...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 glass-card border-dashed p-8 max-w-md mx-auto"
          >
            <Syringe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm">
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
                    <Card className="glass-card-solid border-border transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        {/* Main Row */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="w-full text-left p-4 flex items-center gap-4 group"
                        >
                          {/* Status Dot */}
                          <div className={`w-2 h-2 rounded-full shrink-0 ${statusConfig.dotColor} shadow-sm`} />

                          {/* Patient & Product */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-foreground font-medium text-sm truncate">
                                {order.patientName}
                              </span>
                              {order.priority !== 'routine' && (
                                <span className={`text-[10px] font-mono uppercase tracking-wider ${priorityConfig.color}`}>
                                  {priorityConfig.label}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                              <Package className="w-3 h-3 shrink-0 opacity-70" />
                              <span className="truncate">{order.productName}</span>
                              <span className="opacity-40">·</span>
                              <span>{order.quantity} {order.unit}</span>
                              <span className="opacity-40">·</span>
                              <span className="text-foreground font-medium">{order.route}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge className={`${statusConfig.color} border text-[10px] font-mono uppercase tracking-wider shrink-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>

                          {/* Time */}
                          <span className="text-muted-foreground/70 text-xs font-mono shrink-0 tabular-nums">
                            {formatTime(order.createdAt)}
                          </span>

                          <ChevronRight className={`w-4 h-4 text-muted-foreground/50 transition-transform shrink-0 group-hover:text-foreground ${isExpanded ? 'rotate-90 text-foreground' : ''}`} />
                        </button>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-muted/20"
                            >
                              <div className="px-4 pb-4 pt-1 border-t border-border/50">
                                <div className="pt-4 space-y-4">
                                  {/* Instructions */}
                                  {order.instructions && (
                                    <div>
                                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Instruções</p>
                                      <p className="text-foreground/90 text-sm">{order.instructions}</p>
                                    </div>
                                  )}

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-3 rounded-md border border-border/40">
                                    {order.batchNumber && (
                                      <div>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Lote</p>
                                        <p className="text-foreground/90 text-xs font-mono">{order.batchNumber}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Prescrito por</p>
                                      <p className="text-foreground/90 text-xs">{order.prescribedBy}</p>
                                    </div>
                                    {order.preparedBy && (
                                      <div>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Preparado por</p>
                                        <p className="text-foreground/90 text-xs">{order.preparedBy}</p>
                                      </div>
                                    )}
                                    {order.administeredBy && (
                                      <div>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-0.5">Aplicado por</p>
                                        <p className="text-foreground/90 text-xs">{order.administeredBy}</p>
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
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-mono transition-colors"
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
                                        className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-mono transition-colors"
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
                                        className="border-warning/30 text-warning hover:bg-warning/10 text-xs font-mono transition-colors"
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
