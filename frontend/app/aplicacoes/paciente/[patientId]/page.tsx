'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Syringe, Clock, CheckCircle2, XCircle, ShoppingCart,
  CalendarCheck, ArrowLeft, FileText, Users, Package,
  Hash, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import type { ApplicationOrder } from '@/types/application';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  prescribed:       { label: 'Prescrito',          color: 'text-blue-400',    icon: FileText,     bgColor: 'bg-blue-500/20' },
  waiting_purchase: { label: 'Aguardando Compra',  color: 'text-amber-400',   icon: ShoppingCart,  bgColor: 'bg-amber-500/20' },
  purchased:        { label: 'Comprado',           color: 'text-emerald-400', icon: CheckCircle2,  bgColor: 'bg-emerald-500/20' },
  scheduled:        { label: 'Agendado',           color: 'text-purple-400',  icon: CalendarCheck, bgColor: 'bg-purple-500/20' },
  administered:     { label: 'Aplicado',           color: 'text-cyan-400',    icon: Syringe,       bgColor: 'bg-cyan-500/20' },
  cancelled:        { label: 'Cancelado',          color: 'text-red-400',     icon: XCircle,       bgColor: 'bg-red-500/20' },
};

export default function PatientTimelinePage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['patient-timeline', patientId],
    queryFn: async () => {
      const response = await api.get(`/applications/patient/${patientId}`);
      return response.data as ApplicationOrder[];
    },
    enabled: !!patientId,
  });

  const patientName = timeline?.[0]?.patientName || 'Paciente';

  const formatDateTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const administered = timeline?.filter(o => o.status === 'administered').length || 0;
  const pending = timeline?.filter(o => !['administered', 'cancelled'].includes(o.status)).length || 0;

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/aplicacoes">
            <Button variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              {patientName}
            </h1>
            <p className="text-muted-foreground/70 mt-1">Timeline de aplicações</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{administered}</p>
              <p className="text-muted-foreground/70">Aplicados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{pending}</p>
              <p className="text-muted-foreground/70">Pendentes</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Syringe className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>
        ) : !timeline || timeline.length === 0 ? (
          <Card className="bg-foreground/90/50 border-border">
            <CardContent className="py-12 text-center text-muted-foreground/70">
              <Syringe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma aplicação encontrada para este paciente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {timeline.map((order, i) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.prescribed;
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative pl-20"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-5 top-6 w-7 h-7 rounded-full ${config.bgColor} flex items-center justify-center ring-4 ring-background`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                    </div>

                    <Card className="bg-foreground/90/50 border-border backdrop-blur hover:border-slate-600 transition-colors">
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-lg">{order.productName}</span>
                            <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
                              {config.label}
                            </Badge>
                          </div>
                          <span className="text-muted-foreground/70 text-sm">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground/70">
                            <Package className="w-3.5 h-3.5" />
                            <span>{order.quantity} {order.unit} — {order.route}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground/70">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Dr. {order.prescribedBy}</span>
                          </div>

                          {order.batchNumber && (
                            <div className="flex items-center gap-2 text-emerald-400/80">
                              <Hash className="w-3.5 h-3.5" />
                              <span>Lote: {order.batchNumber}</span>
                            </div>
                          )}

                          {order.manufacturer && (
                            <div className="flex items-center gap-2 text-muted-foreground/70">
                              <Package className="w-3.5 h-3.5" />
                              <span>{order.manufacturer}</span>
                            </div>
                          )}

                          {order.applicationSite && (
                            <div className="flex items-center gap-2 text-cyan-400/80">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{order.applicationSite}</span>
                            </div>
                          )}

                          {order.administeredBy && (
                            <div className="flex items-center gap-2 text-cyan-400/80">
                              <Syringe className="w-3.5 h-3.5" />
                              <span>{order.administeredBy} — {order.administeredAt ? formatDateTime(order.administeredAt) : ''}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {order.administrationNotes && (
                          <div className="mt-3 p-3 rounded-lg bg-slate-800/50 text-sm text-muted-foreground/80">
                            📝 {order.administrationNotes}
                          </div>
                        )}

                        {/* Batch Expiration Warning */}
                        {order.batchExpiration && (
                          <div className="mt-2 text-xs text-muted-foreground/50">
                            Validade do lote: {new Date(order.batchExpiration).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
