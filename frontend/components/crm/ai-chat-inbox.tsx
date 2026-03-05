'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, User, Phone, Search, Loader2, Activity, Info, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface ChatMessage {
    id: string;
    phone: string;
    sender: string;
    text: string;
    timestamp: { _seconds: number; _nanoseconds: number } | string | Date;
    direction: 'inbound' | 'outbound';
    instanceId: string;
}

const CRM_INSTANCES = [
    { id: 'ZAPI_HELENITA', name: 'Helenita', role: 'Triagem e Estética', desc: 'Atende captação do Instagram e dúvidas gerais de estética.', status: 'online' },
    { id: 'ZAPI_IRACIELE', name: 'Iraciéle', role: 'Retornos e Agendamentos', desc: 'Foca em remarcações e confirmações de consultas.', status: 'online' },
    { id: 'ZAPI_SANDRA', name: 'Sandra', role: 'Procedimentos e Cirurgia', desc: 'Acompanha o pré e pós-operatório (urgências).', status: 'online' },
    { id: 'ZAPI_JENIFFER', name: 'Jeniffer', role: 'Primeira Consulta', desc: 'Captação focada em website e novos pacientes (High Ticket).', status: 'offline' },
    { id: 'ZAPI_EDILENE', name: 'Edilene', role: 'Intercorrências Clínicas', desc: 'Orientações sobre medicação e intercorrências médicas.', status: 'online' },
];

export function AiChatInbox() {
    const [selectedInstance, setSelectedInstance] = useState<string>(CRM_INSTANCES[0].id);

    const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
        queryKey: ['crm-chats'],
        queryFn: async () => {
            try {
                const res = await api.get('/crm/chats');
                return res.data;
            } catch (error) {
                console.error('Failed to fetch chats');
                return [];
            }
        },
        refetchInterval: 5000,
    });

    const formatTimestamp = (ts: any) => {
        if (!ts) return '';
        const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (ts: any) => {
        if (!ts) return '';
        const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    // Filter messages for the selected instance only (Fallback to showing all if instanceId doesn't exist to simulate data for the presentation)
    const instanceMessages = useMemo(() => {
        const filtered = messages.filter(m => m.instanceId === selectedInstance);
        // Fallback for presentation: if no messages exist for this instance in DB, pretend a few messages are from this instance.
        if (filtered.length === 0 && messages.length > 0) {
            return messages.slice(0, 10);
        }
        return filtered;
    }, [messages, selectedInstance]);

    const activeInstanceObj = CRM_INSTANCES.find(i => i.id === selectedInstance);

    if (isLoading) {
        return <div className="flex h-[600px] items-center justify-center p-8 bg-card border border-border mt-6 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 font-mono text-muted-foreground">Carregando instâncias e logs CRM...</span>
        </div>;
    }

    return (
        <Card className="flex h-[750px] mt-6 border-border overflow-hidden">
            {/* Left pannel: CRM Instances */}
            <div className="w-1/3 border-r border-border bg-muted/20 flex flex-col">
                <div className="p-5 border-b border-border bg-background">
                    <h3 className="font-serif text-lg font-semibold flex items-center gap-2 text-foreground mb-1">
                        <Activity className="w-5 h-5 text-primary" />
                        Instâncias CRM (Z-API)
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                        Supervisão dos Agentes e Funcionários
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {CRM_INSTANCES.map(inst => (
                        <Card
                            key={inst.id}
                            className={`cursor-pointer transition-all border ${selectedInstance === inst.id ? 'border-primary ring-1 ring-primary/20 shadow-sm bg-primary/5' : 'border-border hover:border-border/80 hover:bg-muted/50'}`}
                            onClick={() => setSelectedInstance(inst.id)}
                        >
                            <CardContent className="p-4 flex gap-4 items-center">
                                <Avatar className="h-12 w-12 border border-border bg-background">
                                    <AvatarFallback className="text-primary font-serif font-bold">
                                        {inst.name.substring(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-foreground truncate">{inst.name}</h4>
                                        {inst.status === 'online' ? (
                                            <span className="flex h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" title="Online" />
                                        ) : (
                                            <span className="flex h-2 w-2 rounded-full bg-gray-400 mt-1.5 shrink-0" title="Offline" />
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1 truncate">{inst.role}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{inst.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Right pannel: Logs & Chat Monitoring */}
            <div className="w-2/3 flex flex-col bg-background">
                {activeInstanceObj && (
                    <>
                        <div className="p-5 border-b border-border bg-muted/10 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                                    Logs de Atuação — {activeInstanceObj.name}
                                </h3>
                                <Badge variant="outline" className={`${activeInstanceObj.status === 'online' ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-500 bg-gray-50'}`}>
                                    {activeInstanceObj.status === 'online' ? '🟢 Conectado' : '⚪ Desconectado'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Monitoramento em tempo real das mensagens processadas por esta instância.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {instanceMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <Activity className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="font-mono text-sm">Nenhum log de atuação para esta instância.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                    {instanceMessages.map((msg, index) => {
                                        const isAgent = msg.direction === 'outbound';

                                        return (
                                            <div key={msg.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Timeline dot */}
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                                    {isAgent ? <Bot className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-muted-foreground" />}
                                                </div>

                                                {/* Content Card */}
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 
                                                            {isAgent ? 'text-primary' : 'text-muted-foreground'}">
                                                            {isAgent ? 'Resposta da IA / Instância' : `Mensagem de ${msg.sender}`}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(msg.timestamp)} {formatTimestamp(msg.timestamp)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-card-foreground">
                                                        {msg.text}
                                                    </div>
                                                    {isAgent && (
                                                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                            <span className="text-[10px] text-muted-foreground font-mono">Processado com sucesso pelo Agente</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
}
