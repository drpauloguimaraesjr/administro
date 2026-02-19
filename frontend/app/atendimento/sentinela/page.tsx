'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MessageSquare,
  Filter,
  Bell,
  Settings,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  User,
  Phone,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SentinelAlert, SentinelAlertType, AttendanceConfig } from '@/types/atendimento';
import api from '@/lib/api';
import { toast } from 'sonner';

const ALERT_TYPE_LABELS: Record<SentinelAlertType, { label: string; icon: string; color: string }> = {
  insecurity: { label: 'Insegurança', icon: '😟', color: 'bg-yellow-100 text-yellow-700' },
  distrust: { label: 'Desconfiança', icon: '🤨', color: 'bg-orange-100 text-orange-700' },
  complaint: { label: 'Reclamação', icon: '😤', color: 'bg-destructive/15 text-red-700' },
  price_concern: { label: 'Preocupação com Preço', icon: '💰', color: 'bg-amber-100 text-amber-700' },
  competitor_mention: { label: 'Mencionou Concorrente', icon: '🏢', color: 'bg-primary/15 text-primary' },
  aggression: { label: 'Tom Agressivo', icon: '😠', color: 'bg-destructive/15 text-red-700' },
  frustration: { label: 'Frustração', icon: '😩', color: 'bg-orange-100 text-orange-700' },
  unresolved_question: { label: 'Dúvida Não Respondida', icon: '❓', color: 'bg-primary/15 text-primary' },
  delayed_response: { label: 'Demora na Resposta', icon: '⏰', color: 'bg-gray-100 text-gray-700' },
  cancellation_intent: { label: 'Intenção de Cancelar', icon: '🚫', color: 'bg-destructive/15 text-red-700' },
  urgent_medical: { label: 'Urgência Médica', icon: '🏥', color: 'bg-destructive/15 text-red-700' },
  custom: { label: 'Personalizado', icon: '⚙️', color: 'bg-gray-100 text-gray-700' },
};

export default function SentinelaPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('new');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery<SentinelAlert[]>({
    queryKey: ['sentinel-alerts', statusFilter],
    queryFn: async () => {
      const res = await api.get(`/attendance/sentinel/alerts?status=${statusFilter}`);
      return res.data;
    },
  });

  // Fetch config
  const { data: config } = useQuery<AttendanceConfig>({
    queryKey: ['attendance-config'],
    queryFn: async () => {
      const res = await api.get('/attendance/config');
      return res.data;
    },
  });

  // Resolve alert mutation
  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/attendance/sentinel/alerts/${id}`, { status: 'resolved' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentinel-alerts'] });
      toast.success('Alerta resolvido');
    },
  });

  // Dismiss alert mutation
  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/attendance/sentinel/alerts/${id}`, { status: 'dismissed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentinel-alerts'] });
      toast.success('Alerta descartado');
    },
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<AttendanceConfig>) => {
      await api.patch('/attendance/config', newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-config'] });
      toast.success('Configurações salvas');
      setIsConfigOpen(false);
    },
  });

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesSearch = searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.triggerMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesType && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">🔴 Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 text-white">🟠 Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">🟡 Médio</Badge>;
      default:
        return <Badge className="bg-primary/100 text-white">🔵 Baixo</Badge>;
    }
  };

  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/atendimento">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" />
                Sistema Sentinela
              </h1>
              <p className="text-muted-foreground">
                Monitoramento inteligente de conversas em tempo real
              </p>
            </div>
          </div>
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Configurações do Sentinela</DialogTitle>
                <DialogDescription>
                  Configure como o sistema monitora e alerta sobre conversas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sentinela Ativo</p>
                    <p className="text-sm text-gray-500">Monitorar todas as conversas</p>
                  </div>
                  <Switch defaultChecked={config?.sentinelConfig.enabled} />
                </div>
                <div className="space-y-2">
                  <Label>Destino dos Alertas</Label>
                  <Select defaultValue={config?.sentinelConfig.alertDestination || 'dashboard'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Apenas Dashboard</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sensibilidade</Label>
                  <Select defaultValue={config?.sentinelConfig.sensitivityLevel || 'medium'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa (menos alertas)</SelectItem>
                      <SelectItem value="medium">Média (equilibrado)</SelectItem>
                      <SelectItem value="high">Alta (mais alertas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chat ID Telegram (opcional)</Label>
                  <Input 
                    placeholder="Ex: 577858261"
                    defaultValue={config?.sentinelConfig.alertTelegramChatId}
                  />
                  <p className="text-xs text-gray-500">
                    Para receber alertas críticos direto no seu Telegram
                  </p>
                </div>
                <div className="space-y-3">
                  <Label>Tipos de Alerta Monitorados</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ALERT_TYPE_LABELS).map(([type, { label, icon }]) => (
                      <div key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={type}
                          defaultChecked={config?.sentinelConfig.alertTypes?.includes(type as SentinelAlertType) ?? true}
                          className="rounded"
                        />
                        <label htmlFor={type} className="text-sm">
                          {icon} {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => updateConfigMutation.mutate({})}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className={alertStats.critical > 0 ? 'border-red-300 bg-destructive/10' : ''}>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-destructive">{alertStats.critical}</p>
                <p className="text-xs text-gray-500">Críticos</p>
              </div>
            </CardContent>
          </Card>
          <Card className={alertStats.high > 0 ? 'border-orange-300 bg-orange-50' : ''}>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{alertStats.high}</p>
                <p className="text-xs text-gray-500">Altos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{alertStats.medium}</p>
                <p className="text-xs text-gray-500">Médios</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{alertStats.low}</p>
                <p className="text-xs text-gray-500">Baixos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{alertStats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar em alertas..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="new">Novos</TabsTrigger>
                  <TabsTrigger value="viewed">Vistos</TabsTrigger>
                  <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(ALERT_TYPE_LABELS).map(([type, { label, icon }]) => (
                    <SelectItem key={type} value={type}>
                      {icon} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-pulse" />
            <p className="text-gray-500">Carregando alertas...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <p className="text-lg font-medium text-primary">Tudo tranquilo!</p>
                <p className="text-sm">
                  {statusFilter === 'new' 
                    ? 'Nenhum alerta novo no momento' 
                    : 'Nenhum alerta encontrado com esses filtros'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const typeInfo = ALERT_TYPE_LABELS[alert.type];
              return (
                <Card 
                  key={alert.id} 
                  className={`
                    ${alert.severity === 'critical' ? 'border-red-300 bg-destructive/10/50' : ''}
                    ${alert.severity === 'high' ? 'border-orange-300 bg-orange-50/50' : ''}
                    ${alert.status === 'new' ? 'border-l-4 border-l-orange-500' : ''}
                  `}
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{typeInfo.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getSeverityBadge(alert.severity)}
                              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(alert.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <h3 className="font-semibold mt-1">{alert.title}</h3>
                            <p className="text-sm text-gray-600">{alert.description}</p>
                          </div>
                        </div>

                        {/* Trigger Message */}
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Mensagem que disparou o alerta:
                          </p>
                          <p className="text-sm italic">"{alert.triggerMessage}"</p>
                        </div>

                        {/* Suggested Action */}
                        {alert.suggestedAction && (
                          <div className="bg-primary/10 p-3 rounded-lg border border-primary/30">
                            <p className="text-xs text-primary mb-1">💡 Ação sugerida:</p>
                            <p className="text-sm text-blue-800">{alert.suggestedAction}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:w-40">
                        <Link href={`/atendimento/conversas/${alert.conversationId}`} className="flex-1 lg:flex-none">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Conversa
                          </Button>
                        </Link>
                        {alert.status === 'new' && (
                          <>
                            <Button 
                              variant="default" 
                              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                              onClick={() => resolveMutation.mutate(alert.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Resolver
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="flex-1 lg:flex-none text-gray-500"
                              onClick={() => dismissMutation.mutate(alert.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Descartar
                            </Button>
                          </>
                        )}
                        {alert.status === 'resolved' && (
                          <Badge variant="outline" className="justify-center py-2">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
                            Resolvido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* How it works */}
        <Card className="bg-primary border-orange-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Como funciona o Sistema Sentinela?</h3>
                <p className="text-gray-600 mt-1">
                  O Sentinela analisa todas as conversas em tempo real usando IA para detectar 
                  padrões de insatisfação, dúvidas não resolvidas, e situações que precisam 
                  de atenção. Você é alertado automaticamente sem que as funcionárias saibam, 
                  permitindo intervenção proativa antes que problemas escalem.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl">🔍</p>
                    <p className="text-xs text-gray-600">Análise de Sentimento</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl">⚡</p>
                    <p className="text-xs text-gray-600">Alertas em Tempo Real</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl">🤫</p>
                    <p className="text-xs text-gray-600">Monitoramento Discreto</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl">💡</p>
                    <p className="text-xs text-gray-600">Sugestões de Ação</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
