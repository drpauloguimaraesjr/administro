'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Timeline } from '@/components/crm/timeline';
import {
    ArrowLeft,
    MessageCircle,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    UserPlus,
    Archive,
    Edit,
    ExternalLink,
    MapPin,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';

// Mock Data for specific lead
const LEAD_DATA = {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '11 99999-9999',
    source: 'whatsapp',
    stage: 'new',
    score: 85,
    urgency: 'high',
    createdAt: new Date().toISOString(),
    interactions: [
        {
            id: '101',
            type: 'whatsapp' as const,
            content: 'Olá! Gostaria de saber mais sobre o tratamento de emagrecimento.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            createdBy: 'Maria Silva (Cliente)',
            direction: 'inbound' as const
        },
        {
            id: '102',
            type: 'whatsapp' as const,
            content: 'Olá Maria! Claro, podemos agendar uma avaliação. Qual o melhor horário para você?',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
            createdBy: 'Atendente Ana',
            direction: 'outbound' as const
        },
        {
            id: '103',
            type: 'note' as const,
            content: 'Cliente muito interessada, mencionou indicação de amiga. Prioridade alta.',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            createdBy: 'Atendente Ana'
        }
    ]
};

export default function LeadDetailsPage({ params }: { params: { id: string } }) {
    // In a real app, fetch data based on params.id
    const lead = LEAD_DATA;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="flex-none p-4 border-b bg-white dark:bg-slate-900 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lead.name}</h1>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Novo</Badge>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Alta Urgência</Badge>
                        </div>
                        <p className="text-sm text-slate-500">Lead criado via WhatsApp há 2 horas</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                            <Archive className="w-4 h-4 mr-2" />
                            Perdido
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Converter em Paciente
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="container mx-auto p-6 h-full">
                    <div className="grid grid-cols-12 gap-6 h-full">
                        {/* Left Column: Info Card */}
                        <div className="col-span-4 space-y-6 overflow-y-auto pr-2 pb-10">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base font-semibold">Informações do Cliente</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center py-4 border-b">
                                        <Avatar className="w-20 h-20 mb-3">
                                            <AvatarFallback className="text-xl bg-purple-100 text-purple-700">MS</AvatarFallback>
                                        </Avatar>
                                        <h2 className="text-lg font-bold">{lead.name}</h2>
                                        <p className="text-sm text-slate-500">Score: <span className="text-green-600 font-bold">{lead.score}/100</span></p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500">Telefone</p>
                                                <p className="text-sm font-medium">{lead.phone}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 bg-green-50 hover:bg-green-100">
                                                <MessageCircle className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500">Email</p>
                                                <p className="text-sm font-medium">{lead.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500">Origem</p>
                                                <p className="text-sm font-medium capitalize">{lead.source}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">Próximos Passos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 flex gap-2">
                                        <CalendarIcon className="w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-semibold">Agendar Avaliação</p>
                                            <p className="text-xs mt-1 opacity-90">Cliente solicitou horário. Aguardando retorno.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4 text-xs">
                                        <CalendarIcon className="w-3 h-3 mr-2" /> Agendar Tarefa
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Timeline & Tabs */}
                        <div className="col-span-8 bg-white dark:bg-slate-900 rounded-lg border shadow-sm flex flex-col overflow-hidden">
                            <Tabs defaultValue="timeline" className="flex-1 flex flex-col">
                                <div className="border-b px-4">
                                    <TabsList className="bg-transparent h-14 w-full justify-start gap-6">
                                        <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-0 font-semibold">
                                            Timeline
                                        </TabsTrigger>
                                        <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-0 font-semibold">
                                            Tarefas
                                        </TabsTrigger>
                                        <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none h-full px-0 font-semibold">
                                            Documentos
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
                                    <TabsContent value="timeline" className="mt-0 h-full">
                                        <Timeline interactions={lead.interactions} />
                                    </TabsContent>

                                    <TabsContent value="tasks" className="mt-0">
                                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                            <p>Nenhuma tarefa pendente</p>
                                            <Button variant="link">Criar primeira tarefa</Button>
                                        </div>
                                    </TabsContent>
                                </div>

                                {/* Quick Action Bar (Bottom) */}
                                <div className="p-4 bg-white border-t flex gap-2">
                                    <Button className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 justify-start px-4 text-slate-400 font-normal">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Escreva uma nota ou registre uma interação...
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button size="icon" className="bg-green-600 hover:bg-green-700"><MessageCircle className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="outline"><Phone className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
