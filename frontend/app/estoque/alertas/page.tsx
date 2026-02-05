'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell, AlertTriangle, ShieldAlert, Package,
  Check, Eye, ArrowLeft, RefreshCw, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'high_consumption';
  severity: 'critical' | 'warning' | 'info';
  itemId: string;
  itemName: string;
  batchId?: string;
  message: string;
  details: Record<string, unknown>;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
}

export default function AlertasPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('active');
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['inventory-alerts', filter],
    queryFn: async () => {
      const status = filter === 'all' ? undefined : filter;
      const response = await api.get('/inventory/alerts/all', { params: { status } });
      return response.data as InventoryAlert[];
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.post(`/inventory/alerts/${alertId}/acknowledge`, { userId: 'admin' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await api.post(`/inventory/alerts/${alertId}/resolve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    }
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package className="w-5 h-5" />;
      case 'out_of_stock': return <AlertTriangle className="w-5 h-5" />;
      case 'expiring_soon': return <Calendar className="w-5 h-5" />;
      case 'expired': return <ShieldAlert className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-red-500">Ativo</Badge>;
      case 'acknowledged': return <Badge className="bg-yellow-500">Visto</Badge>;
      case 'resolved': return <Badge className="bg-green-500">Resolvido</Badge>;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
                Alertas de Estoque
              </h1>
              <p className="text-slate-400 mt-1">Monitore problemas e tome ação</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-red-500 hover:bg-red-600' : 'border-slate-600'}
          >
            Ativos
          </Button>
          <Button
            variant={filter === 'acknowledged' ? 'default' : 'outline'}
            onClick={() => setFilter('acknowledged')}
            className={filter === 'acknowledged' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-slate-600'}
          >
            Vistos
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-slate-600 hover:bg-slate-700' : 'border-slate-600'}
          >
            Todos
          </Button>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : alerts?.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-slate-500 mb-4" />
              <p className="text-slate-400 text-lg">Nenhum alerta encontrado</p>
              <p className="text-slate-500 text-sm">Tudo certo com seu estoque!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border ${getSeverityColor(alert.severity)} bg-slate-800/50`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">{alert.message}</h3>
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-slate-400 text-sm mt-1">
                            Produto: <span className="text-white">{alert.itemName}</span>
                          </p>
                          <p className="text-slate-500 text-xs mt-2">
                            Criado em: {formatDate(alert.createdAt)}
                          </p>
                          {alert.acknowledgedAt && (
                            <p className="text-slate-500 text-xs">
                              Visto em: {formatDate(alert.acknowledgedAt)}
                            </p>
                          )}
                          {/* Details */}
                          {alert.details && Object.keys(alert.details).length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-slate-700/50 text-sm">
                              {Object.entries(alert.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-slate-300">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                  <span className="text-white">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeMutation.mutate(alert.id)}
                            disabled={acknowledgeMutation.isPending}
                            className="border-slate-600 hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Marcar Visto
                          </Button>
                        )}
                        {(alert.status === 'active' || alert.status === 'acknowledged') && (
                          <Button
                            size="sm"
                            onClick={() => resolveMutation.mutate(alert.id)}
                            disabled={resolveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
