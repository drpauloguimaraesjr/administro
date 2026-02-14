'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  Smartphone,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  TrendingUp,
  Activity,
  Settings,
  Plus,
  ArrowRight,
  Eye,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AttendanceDashboard, SentinelAlert, ZAPIInstance, AIAgent } from '@/types/atendimento';
import api from '@/lib/api';

export default function AtendimentoPage() {
  // Fetch dashboard data
  const { data: dashboard, isLoading } = useQuery<AttendanceDashboard>({
    queryKey: ['attendance-dashboard'],
    queryFn: async () => {
      const res = await api.get('/attendance/dashboard');
      return res.data;
    },
  });

  // Fetch instances
  const { data: instances = [] } = useQuery<ZAPIInstance[]>({
    queryKey: ['zapi-instances'],
    queryFn: async () => {
      const res = await api.get('/attendance/instances');
      return res.data;
    },
  });

  // Fetch agents
  const { data: agents = [] } = useQuery<AIAgent[]>({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const res = await api.get('/attendance/agents');
      return res.data;
    },
  });

  // Fetch sentinel alerts
  const { data: alerts = [] } = useQuery<SentinelAlert[]>({
    queryKey: ['sentinel-alerts', 'new'],
    queryFn: async () => {
      const res = await api.get('/attendance/sentinel/alerts?status=new');
      return res.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-primary/100';
      case 'disconnected': return 'bg-destructive/100';
      case 'connecting': return 'bg-yellow-500';
      case 'qr_required': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'autopilot': return <Zap className="w-4 h-4 text-primary" />;
      case 'copilot': return <Brain className="w-4 h-4 text-primary" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/15 text-red-700 border-destructive/30';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-primary/15 text-primary border-primary/30';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Central de Atendimento IA
            </h1>
            <p className="text-muted-foreground">
              Gerencie agentes, instâncias WhatsApp e monitoramento Sentinela
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/atendimento/conversas">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Conversas
              </Button>
            </Link>
            <Link href="/atendimento/instancias">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Instância
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversas Ativas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : dashboard?.overview.activeConversations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard?.overview.pendingResponses || 0} aguardando resposta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Instâncias WhatsApp
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? '...' : dashboard?.instances.connected || 0}
                <span className="text-gray-400 text-lg">/{dashboard?.instances.total || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                conectadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Agentes IA
              </CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : dashboard?.agents.total || 0}
              </div>
              <div className="flex gap-2 mt-1">
                <Badge className="bg-primary/15 text-primary text-xs">
                  {dashboard?.agents.autopilot || 0} autopilot
                </Badge>
                <Badge className="bg-primary/15 text-primary text-xs">
                  {dashboard?.agents.copilot || 0} copilot
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className={alerts.filter(a => a.severity === 'critical').length > 0 ? 'border-red-300 bg-destructive/10/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas Sentinela
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? '...' : dashboard?.sentinel.newAlerts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard?.sentinel.criticalAlerts || 0} críticos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Instances & Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instances */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Instâncias WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Conexões Z-API ativas
                  </CardDescription>
                </div>
                <Link href="/atendimento/instancias">
                  <Button variant="ghost" size="sm">
                    Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {instances.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma instância configurada</p>
                    <Link href="/atendimento/instancias">
                      <Button variant="link">Adicionar primeira instância</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {instances.slice(0, 4).map((instance) => (
                      <div
                        key={instance.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)}`} />
                          <div>
                            <p className="font-medium">{instance.name}</p>
                            <p className="text-sm text-gray-500">{instance.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {instance.status === 'qr_required' && (
                            <Badge variant="outline" className="text-orange-600">
                              QR Code
                            </Badge>
                          )}
                          <Link href={`/atendimento/instancias/${instance.id}`}>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Agentes de IA
                  </CardTitle>
                  <CardDescription>
                    Assistentes inteligentes configurados
                  </CardDescription>
                </div>
                <Link href="/atendimento/agentes">
                  <Button variant="ghost" size="sm">
                    Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum agente configurado</p>
                    <Link href="/atendimento/agentes">
                      <Button variant="link">Criar primeiro agente</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.slice(0, 4).map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {getModeIcon(agent.mode)}
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-gray-500">
                              {agent.mode === 'autopilot' ? 'Automático' : 
                               agent.mode === 'copilot' ? 'Copiloto' : 'Desativado'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="text-gray-600">{agent.stats.totalMessages} msgs</p>
                            <p className="text-gray-400">{agent.stats.avgResponseTime}s avg</p>
                          </div>
                          <Link href={`/atendimento/agentes/${agent.id}`}>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mensagens tratadas pela IA</span>
                      <span className="font-medium">
                        {dashboard?.performance.messagesHandledByAI || 0} de {
                          (dashboard?.performance.messagesHandledByAI || 0) + 
                          (dashboard?.performance.messagesHandledByHumans || 0)
                        }
                      </span>
                    </div>
                    <Progress 
                      value={
                        ((dashboard?.performance.messagesHandledByAI || 0) / 
                        Math.max(1, (dashboard?.performance.messagesHandledByAI || 0) + 
                        (dashboard?.performance.messagesHandledByHumans || 0))) * 100
                      } 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de precisão</span>
                      <span className="font-medium text-primary">
                        {dashboard?.performance.aiAccuracyRate || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={dashboard?.performance.aiAccuracyRate || 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {dashboard?.overview.avgResponseTime || 0}s
                      </p>
                      <p className="text-xs text-gray-500">Tempo médio de resposta</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {dashboard?.sentinel.resolvedToday || 0}
                      </p>
                      <p className="text-xs text-gray-500">Alertas resolvidos hoje</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sentinel Alerts */}
          <div className="space-y-6">
            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between bg-orange-50 rounded-t-lg">
                <div>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Shield className="w-5 h-5" />
                    Sistema Sentinela
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    Monitoramento em tempo real
                  </CardDescription>
                </div>
                <Link href="/atendimento/sentinela">
                  <Button variant="ghost" size="sm" className="text-orange-700">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver tudo
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-300" />
                    <p className="text-primary font-medium">Tudo tranquilo!</p>
                    <p className="text-sm">Nenhum alerta no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={getSeverityColor(alert.severity)}
                              >
                                {alert.severity === 'critical' ? '🔴' : 
                                 alert.severity === 'high' ? '🟠' : 
                                 alert.severity === 'medium' ? '🟡' : '🔵'}
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="font-medium mt-1">{alert.title}</p>
                            <p className="text-sm mt-1 opacity-75">{alert.description}</p>
                            <p className="text-xs mt-2 italic opacity-60">
                              "{alert.triggerMessage.slice(0, 100)}..."
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-current/10">
                          <span className="text-xs opacity-60">
                            {new Date(alert.createdAt).toLocaleTimeString('pt-BR')}
                          </span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs">
                            Resolver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/atendimento/instancias" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Instância Z-API
                  </Button>
                </Link>
                <Link href="/atendimento/agentes" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Bot className="w-4 h-4 mr-2" />
                    Criar Agente IA
                  </Button>
                </Link>
                <Link href="/atendimento/sentinela" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Configurar Sentinela
                  </Button>
                </Link>
                <Link href="/atendimento/conversas" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ver Conversas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
