'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Bot,
  Plus,
  Settings,
  Trash2,
  ArrowLeft,
  Zap,
  Brain,
  XCircle,
  Loader2,
  MessageSquare,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { AIAgent, AgentMode, Employee } from '@/types/atendimento';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AgentesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    mode: 'copilot' as AgentMode,
    linkedEmployeeId: '',
    personality: {
      tone: 'professional' as const,
      responseStyle: 'balanced' as const,
      greetingTemplate: 'Olá! Como posso ajudar?',
      signatureTemplate: 'Atenciosamente, Clínica Dr. Paulo',
      customInstructions: '',
    },
    learningEnabled: true,
  });

  // Fetch agents
  const { data: agents = [], isLoading } = useQuery<AIAgent[]>({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const res = await api.get('/attendance/agents');
      return res.data;
    },
  });

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/attendance/employees');
      return res.data;
    },
  });

  // Create agent mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newAgent) => {
      const res = await api.post('/attendance/agents', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      setIsDialogOpen(false);
      toast.success('Agente criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar agente');
    },
  });

  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/attendance/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast.success('Agente removido');
    },
  });

  // Toggle mode mutation
  const toggleModeMutation = useMutation({
    mutationFn: async ({ id, mode }: { id: string; mode: AgentMode }) => {
      const res = await api.patch(`/attendance/agents/${id}`, { mode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast.success('Modo atualizado');
    },
  });

  const getModeIcon = (mode: AgentMode) => {
    switch (mode) {
      case 'autopilot':
        return <Zap className="w-5 h-5 text-primary" />;
      case 'copilot':
        return <Brain className="w-5 h-5 text-primary" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getModeBadge = (mode: AgentMode) => {
    switch (mode) {
      case 'autopilot':
        return <Badge className="bg-primary/15 text-primary"><Zap className="w-3 h-3 mr-1" />Autopilot</Badge>;
      case 'copilot':
        return <Badge className="bg-primary/15 text-primary"><Brain className="w-3 h-3 mr-1" />Copilot</Badge>;
      default:
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Desativado</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
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
                <Bot className="w-8 h-8 text-primary" />
                Agentes de IA
              </h1>
              <p className="text-muted-foreground">
                Configure assistentes inteligentes para cada atendente
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Agente de IA</DialogTitle>
                <DialogDescription>
                  Configure um novo assistente inteligente para atendimento
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="personality">Personalidade</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Agente *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Agente Maria, Assistente Recepção"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modo de Operação</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          newAgent.mode === 'autopilot' ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setNewAgent({ ...newAgent, mode: 'autopilot' })}
                      >
                        <Zap className="w-6 h-6 text-primary mb-2" />
                        <p className="font-medium">Autopilot</p>
                        <p className="text-xs text-gray-500">Responde automaticamente</p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          newAgent.mode === 'copilot' ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setNewAgent({ ...newAgent, mode: 'copilot' })}
                      >
                        <Brain className="w-6 h-6 text-primary mb-2" />
                        <p className="font-medium">Copilot</p>
                        <p className="text-xs text-gray-500">Sugere respostas</p>
                      </div>
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          newAgent.mode === 'disabled' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setNewAgent({ ...newAgent, mode: 'disabled' })}
                      >
                        <XCircle className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="font-medium">Desativado</p>
                        <p className="text-xs text-gray-500">Apenas monitora</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee">Funcionário Vinculado (opcional)</Label>
                    <Select
                      value={newAgent.linkedEmployeeId}
                      onValueChange={(value) => setNewAgent({ ...newAgent, linkedEmployeeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum (agente independente)</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Vincular a um funcionário permite que o agente aprenda o estilo de resposta dele
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Aprendizado Contínuo</p>
                      <p className="text-sm text-gray-500">
                        O agente aprende com edições e correções
                      </p>
                    </div>
                    <Switch
                      checked={newAgent.learningEnabled}
                      onCheckedChange={(checked) => setNewAgent({ ...newAgent, learningEnabled: checked })}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="personality" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Tom de Voz</Label>
                    <Select
                      value={newAgent.personality.tone}
                      onValueChange={(value: any) => setNewAgent({
                        ...newAgent,
                        personality: { ...newAgent.personality, tone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="friendly">Amigável</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estilo de Resposta</Label>
                    <Select
                      value={newAgent.personality.responseStyle}
                      onValueChange={(value: any) => setNewAgent({
                        ...newAgent,
                        personality: { ...newAgent.personality, responseStyle: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Conciso</SelectItem>
                        <SelectItem value="balanced">Equilibrado</SelectItem>
                        <SelectItem value="detailed">Detalhado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="greeting">Saudação Padrão</Label>
                    <Input
                      id="greeting"
                      placeholder="Ex: Olá! Como posso ajudar?"
                      value={newAgent.personality.greetingTemplate}
                      onChange={(e) => setNewAgent({
                        ...newAgent,
                        personality: { ...newAgent.personality, greetingTemplate: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signature">Assinatura</Label>
                    <Input
                      id="signature"
                      placeholder="Ex: Atenciosamente, Clínica Dr. Paulo"
                      value={newAgent.personality.signatureTemplate}
                      onChange={(e) => setNewAgent({
                        ...newAgent,
                        personality: { ...newAgent.personality, signatureTemplate: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instruções Personalizadas</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Ex: Sempre confirme o nome do paciente antes de agendar. Nunca forneça diagnósticos..."
                      rows={4}
                      value={newAgent.personality.customInstructions}
                      onChange={(e) => setNewAgent({
                        ...newAgent,
                        personality: { ...newAgent.personality, customInstructions: e.target.value }
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      Regras e comportamentos específicos para este agente
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => createMutation.mutate(newAgent)} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar Agente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mode Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-green-800">Modo Autopilot</h3>
              </div>
              <p className="text-sm text-primary">
                O agente responde automaticamente às mensagens. Ideal para fora do expediente 
                ou perguntas frequentes.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-blue-800">Modo Copilot</h3>
              </div>
              <p className="text-sm text-primary">
                O agente sugere respostas que o funcionário pode aprovar, editar ou rejeitar. 
                Aprende com cada interação.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">Aprendizado</h3>
              </div>
              <p className="text-sm text-primary">
                Quando ativado, o agente aprende o estilo de cada funcionário através 
                das edições e correções feitas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          </div>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum agente configurado</p>
                <p className="text-sm">Crie seu primeiro agente de IA para começar</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Agente
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover: transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getModeIcon(agent.mode)}
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>
                          {agent.linkedEmployeeId 
                            ? `Vinculado a ${employees.find(e => e.id === agent.linkedEmployeeId)?.name || 'funcionário'}`
                            : 'Agente independente'
                          }
                        </CardDescription>
                      </div>
                    </div>
                    {getModeBadge(agent.mode)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MessageSquare className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-lg font-bold">{agent.stats.totalMessages}</p>
                      <p className="text-xs text-gray-500">Mensagens</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-lg font-bold">{agent.stats.avgResponseTime}s</p>
                      <p className="text-xs text-gray-500">Tempo médio</p>
                    </div>
                  </div>
                  {agent.mode === 'copilot' && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary">Taxa de aceitação</span>
                        <span className="font-medium text-blue-800">
                          {Math.round((agent.stats.suggestionsAccepted / 
                            Math.max(1, agent.stats.suggestionsAccepted + agent.stats.suggestionsEdited + agent.stats.suggestionsRejected)) * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-primary">
                        {agent.stats.suggestionsAccepted} aceitas • {agent.stats.suggestionsEdited} editadas • {agent.stats.suggestionsRejected} rejeitadas
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Select
                      value={agent.mode}
                      onValueChange={(mode: AgentMode) => toggleModeMutation.mutate({ id: agent.id, mode })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autopilot">Autopilot</SelectItem>
                        <SelectItem value="copilot">Copilot</SelectItem>
                        <SelectItem value="disabled">Desativado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link href={`/atendimento/agentes/${agent.id}`}>
                      <Button variant="outline" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-red-700"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este agente?')) {
                          deleteMutation.mutate(agent.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
