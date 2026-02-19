'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  Search,
  Filter,
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Phone,
  Send,
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
import { Conversation, ZAPIInstance } from '@/types/atendimento';
import api from '@/lib/api';

export default function ConversasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [instanceFilter, setInstanceFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations', statusFilter, instanceFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (instanceFilter !== 'all') params.append('instanceId', instanceFilter);
      const res = await api.get(`/attendance/conversations?${params}`);
      return res.data;
    },
  });

  // Fetch instances for filter
  const { data: instances = [] } = useQuery<ZAPIInstance[]>({
    queryKey: ['zapi-instances'],
    queryFn: async () => {
      const res = await api.get('/attendance/instances');
      return res.data;
    },
  });

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' ||
      conv.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contactPhone.includes(searchQuery);
    return matchesSearch;
  });

  const getStatusBadge = (status: Conversation['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/15 text-primary">Ativa</Badge>;
      case 'waiting_response':
        return <Badge className="bg-yellow-100 text-yellow-700">Aguardando</Badge>;
      case 'escalated':
        return <Badge className="bg-destructive/15 text-red-700">Escalada</Badge>;
      case 'resolved':
        return <Badge variant="outline">Resolvida</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR');
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
                <MessageSquare className="w-8 h-8 text-primary" />
                Conversas
              </h1>
              <p className="text-muted-foreground">
                Gerencie todas as conversas de atendimento
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="waiting_response">Aguardando</SelectItem>
                  <SelectItem value="escalated">Escaladas</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={instanceFilter} onValueChange={setInstanceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Instância" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as instâncias</SelectItem>
                  {instances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1 space-y-2">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Carregando conversas...
              </div>
            ) : filteredConversations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredConversations.map((conv) => (
                <Card
                  key={conv.id}
                  className={`cursor-pointer transition-all hover: ${
                    selectedConversation?.id === conv.id ? 'ring-2 ring-blue-500' : ''
                  } ${conv.sentinelFlags.length > 0 ? 'border-l-4 border-l-orange-500' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {conv.contactName || conv.contactPhone}
                          </p>
                          <p className="text-sm text-gray-500">
                            {conv.contactName ? conv.contactPhone : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatTime(conv.lastMessageAt)}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-primary text-white mt-1">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(conv.status)}
                      {conv.assignedTo === 'agent' && (
                        <Badge variant="outline" className="gap-1">
                          <Bot className="w-3 h-3" />
                          IA
                        </Badge>
                      )}
                      {conv.sentinelFlags.length > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {conv.sentinelFlags.length}
                        </Badge>
                      )}
                    </div>
                    {conv.messages.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2 truncate">
                        {conv.messages[conv.messages.length - 1].content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-[calc(100vh-300px)] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle>
                          {selectedConversation.contactName || selectedConversation.contactPhone}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {selectedConversation.contactPhone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedConversation.status)}
                      {selectedConversation.patientId && (
                        <Link href={`/patients/${selectedConversation.patientId}`}>
                          <Button variant="outline" size="sm">
                            Ver Paciente
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.direction === 'outbound'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.sender.type === 'agent' && (
                          <div className="flex items-center gap-1 text-xs mb-1 opacity-75">
                            <Bot className="w-3 h-3" />
                            {msg.sender.name || 'Agente IA'}
                          </div>
                        )}
                        {msg.sender.type === 'employee' && (
                          <div className="flex items-center gap-1 text-xs mb-1 opacity-75">
                            <User className="w-3 h-3" />
                            {msg.sender.name}
                          </div>
                        )}
                        <p>{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${msg.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sentinelAnalysis?.requiresAttention && (
                            <AlertTriangle className="w-3 h-3 text-orange-400" />
                          )}
                        </div>
                        {msg.aiSuggestion && msg.aiSuggestion.status === 'pending' && (
                          <div className="mt-2 p-2 bg-white/20 rounded text-sm">
                            <p className="text-xs opacity-75">💡 Sugestão da IA:</p>
                            <p>{msg.aiSuggestion.suggestedText}</p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="secondary" className="h-6 text-xs">
                                Aprovar
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 text-xs">
                                Editar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite uma mensagem..."
                      className="flex-1"
                    />
                    <Button>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-300px)] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Selecione uma conversa</p>
                  <p className="text-sm">Clique em uma conversa ao lado para ver os detalhes</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
