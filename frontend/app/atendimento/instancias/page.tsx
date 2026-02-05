'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Smartphone,
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Bot,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ZAPIInstance, AIAgent } from '@/types/atendimento';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function InstanciasPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [newInstance, setNewInstance] = useState({
    name: '',
    phone: '',
    zapiInstanceId: '',
    zapiToken: '',
    assignedAgentId: '',
  });

  // Fetch instances
  const { data: instances = [], isLoading } = useQuery<ZAPIInstance[]>({
    queryKey: ['zapi-instances'],
    queryFn: async () => {
      const res = await api.get('/attendance/instances');
      return res.data;
    },
  });

  // Fetch agents for assignment
  const { data: agents = [] } = useQuery<AIAgent[]>({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const res = await api.get('/attendance/agents');
      return res.data;
    },
  });

  // Create instance mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newInstance) => {
      const res = await api.post('/attendance/instances', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zapi-instances'] });
      setIsDialogOpen(false);
      setNewInstance({ name: '', phone: '', zapiInstanceId: '', zapiToken: '', assignedAgentId: '' });
      toast.success('Instância criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar instância');
    },
  });

  // Delete instance mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/attendance/instances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zapi-instances'] });
      toast.success('Instância removida');
    },
  });

  // Reconnect instance mutation
  const reconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/attendance/instances/${id}/reconnect`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['zapi-instances'] });
      if (data.qrCode) {
        toast.info('Escaneie o QR Code para conectar');
      } else {
        toast.success('Reconectado com sucesso!');
      }
    },
  });

  const getStatusBadge = (status: ZAPIInstance['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Desconectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-700"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Conectando</Badge>;
      case 'qr_required':
        return <Badge className="bg-orange-100 text-orange-700"><QrCode className="w-3 h-3 mr-1" />QR Necessário</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleSubmit = () => {
    if (!newInstance.name || !newInstance.zapiInstanceId || !newInstance.zapiToken) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    createMutation.mutate(newInstance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência');
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
                <Smartphone className="w-8 h-8 text-green-600" />
                Instâncias Z-API
              </h1>
              <p className="text-muted-foreground">
                Configure suas conexões WhatsApp via Z-API
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Instância
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Instância Z-API</DialogTitle>
                <DialogDescription>
                  Configure uma nova conexão WhatsApp. Você precisará das credenciais do Z-API.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Instância *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Recepção Principal"
                    value={newInstance.name}
                    onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Número WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: 5511999999999"
                    value={newInstance.phone}
                    onChange={(e) => setNewInstance({ ...newInstance, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zapiInstanceId">Instance ID (Z-API) *</Label>
                  <Input
                    id="zapiInstanceId"
                    placeholder="Seu Instance ID do Z-API"
                    value={newInstance.zapiInstanceId}
                    onChange={(e) => setNewInstance({ ...newInstance, zapiInstanceId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zapiToken">Token (Z-API) *</Label>
                  <Input
                    id="zapiToken"
                    type="password"
                    placeholder="Seu Token do Z-API"
                    value={newInstance.zapiToken}
                    onChange={(e) => setNewInstance({ ...newInstance, zapiToken: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent">Agente de IA (opcional)</Label>
                  <Select
                    value={newInstance.assignedAgentId}
                    onValueChange={(value) => setNewInstance({ ...newInstance, assignedAgentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um agente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum (manual)</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} ({agent.mode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                  <p className="font-medium">Como obter credenciais Z-API:</p>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>Acesse <a href="https://z-api.io" target="_blank" className="underline">z-api.io</a></li>
                    <li>Crie ou acesse sua instância</li>
                    <li>Copie o Instance ID e Token</li>
                  </ol>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Instances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Instâncias</CardTitle>
            <CardDescription>
              {instances.length} instância(s) configurada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : instances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma instância configurada</p>
                <p className="text-sm">Adicione sua primeira instância Z-API para começar</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Instância
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agente IA</TableHead>
                      <TableHead>Instance ID</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">{instance.name}</TableCell>
                        <TableCell>{instance.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(instance.status)}</TableCell>
                        <TableCell>
                          {instance.assignedAgentId ? (
                            <Badge variant="outline" className="gap-1">
                              <Bot className="w-3 h-3" />
                              {agents.find(a => a.id === instance.assignedAgentId)?.name || 'Agente'}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {showToken === instance.id ? instance.zapiInstanceId : '••••••••'}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setShowToken(showToken === instance.id ? null : instance.id)}
                            >
                              {showToken === instance.id ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(instance.zapiInstanceId)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {instance.status === 'qr_required' && instance.qrCode && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <QrCode className="w-4 h-4 mr-1" />
                                    QR Code
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Escaneie o QR Code</DialogTitle>
                                    <DialogDescription>
                                      Abra o WhatsApp no celular e escaneie este código
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-center py-4">
                                    <img
                                      src={instance.qrCode}
                                      alt="QR Code"
                                      className="w-64 h-64"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            {(instance.status === 'disconnected' || instance.status === 'qr_required') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reconnectMutation.mutate(instance.id)}
                                disabled={reconnectMutation.isPending}
                              >
                                <RefreshCw className={`w-4 h-4 mr-1 ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
                                Reconectar
                              </Button>
                            )}
                            <Link href={`/atendimento/instancias/${instance.id}`}>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja remover esta instância?')) {
                                  deleteMutation.mutate(instance.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Como funciona a integração Z-API?</h3>
                <p className="text-gray-600 mt-1">
                  O Z-API permite conectar números de WhatsApp ao sistema. Cada instância representa 
                  um número que pode receber e enviar mensagens automaticamente através dos agentes de IA.
                </p>
                <div className="flex gap-4 mt-4">
                  <a href="https://z-api.io" target="_blank">
                    <Button variant="outline" size="sm">
                      Acessar Z-API
                    </Button>
                  </a>
                  <a href="https://developer.z-api.io" target="_blank">
                    <Button variant="ghost" size="sm">
                      Documentação
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
