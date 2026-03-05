'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, User, Phone, Search, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

export function AiChatInbox() {
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        refetchInterval: 5000, // Poll every 5 seconds for real-time feel
    });

    // Group messages by phone
    const conversations = useMemo(() => {
        const groups: Record<string, ChatMessage[]> = {};
        messages.forEach(msg => {
            if (!groups[msg.phone]) groups[msg.phone] = [];
            groups[msg.phone].push(msg);
        });

        // Convert to array and sort by latest message
        return Object.entries(groups).map(([phone, msgs]) => {
            // Messages from API are already sorted desc, so first is latest
            const latestMessage = msgs[0];
            return {
                phone,
                sender: msgs.find(m => m.direction === 'inbound')?.sender || 'Desconhecido',
                latestMessage,
                messages: msgs.reverse(), // Reverse for chronological display
            };
        }).sort((a, b) => {
            const timeA = new Date(a.latestMessage.timestamp as string).getTime();
            const timeB = new Date(b.latestMessage.timestamp as string).getTime();
            return timeB - timeA;
        });
    }, [messages]);

    const filteredConversations = conversations.filter(c =>
        c.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const activeConversation = conversations.find(c => c.phone === selectedPhone);

    const formatTimestamp = (ts: any) => {
        if (!ts) return '';
        const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return <div className="flex h-[600px] items-center justify-center p-8 bg-card border border-border mt-6 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 font-mono text-muted-foreground">Carregando interações do Agente...</span>
        </div>;
    }

    return (
        <Card className="flex h-[650px] mt-6 border-border overflow-hidden">
            {/* Left pannel: Contacts List */}
            <div className="w-1/3 border-r border-border bg-muted/20 flex flex-col">
                <div className="p-4 border-b border-border">
                    <h3 className="font-serif text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
                        <Bot className="w-5 h-5 text-primary" />
                        Caixa do Agente IA
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar paciente ou número..."
                            className="pl-9 bg-background border-border"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredConversations.length === 0 && (
                        <p className="text-center font-mono text-xs text-muted-foreground py-8">Nenhuma conversa encontrada.</p>
                    )}
                    {filteredConversations.map(conv => (
                        <button
                            key={conv.phone}
                            onClick={() => setSelectedPhone(conv.phone)}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${selectedPhone === conv.phone ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'
                                }`}
                        >
                            <Avatar className="h-10 w-10 border border-border">
                                <AvatarFallback className="bg-background text-primary font-mono text-xs">
                                    {conv.sender.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="font-semibold text-sm truncate text-foreground">{conv.sender}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">{formatTimestamp(conv.latestMessage.timestamp)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                    {conv.latestMessage.direction === 'outbound' ? '🤖 ' : '👤 '}
                                    {conv.latestMessage.text}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right pannel: Chat Messages */}
            <div className="w-2/3 flex flex-col bg-background">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarFallback className="bg-primary/20 text-primary font-mono">
                                        {activeConversation.sender.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-foreground">{activeConversation.sender}</h4>
                                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {activeConversation.phone}
                                    </p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                <Bot className="w-3 h-3" />
                                {activeConversation.latestMessage.instanceId}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeConversation.messages.map(msg => {
                                const isAgent = msg.direction === 'outbound';
                                return (
                                    <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl p-3 ${isAgent
                                                ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-sm'
                                                : 'bg-muted border border-border text-foreground rounded-tl-sm'
                                            }`}>
                                            <div className="flex items-center gap-1.5 mb-1 opacity-70">
                                                {isAgent ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                <span className="text-[10px] font-mono tracking-wider">
                                                    {isAgent ? 'Agente IA' : msg.sender}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                            <span className="text-[9px] font-mono opacity-50 block text-right mt-1">
                                                {formatTimestamp(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <Bot className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-mono text-sm">Selecione uma conversa para ver a interação da IA.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
