import React from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Shield, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsHubPage() {
    const options = [
        {
            title: 'Usuários e Permissões',
            description: 'Gerencie o acesso da sua equipe, crie novos usuários e defina cargos.',
            icon: <Users className="w-8 h-8 text-blue-500" />,
            href: '/configuracoes/usuarios',
            color: 'bg-blue-50 border-blue-200'
        },
        {
            title: 'Filas do WhatsApp',
            description: 'Configure filas de atendimento, automações e distribuição de chamados.',
            icon: <MessageSquare className="w-8 h-8 text-green-500" />,
            href: '/configuracoes/filas-whatsapp',
            color: 'bg-green-50 border-green-200'
        }
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-slate-500">Gerencie todos os aspectos do seu sistema em um só lugar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {options.map((option, index) => (
                    <Link href={option.href} key={index} className="group block">
                        <Card className="h-full hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: 'transparent' }}>
                            <CardHeader>
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${option.color}`}>
                                    {option.icon}
                                </div>
                                <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                                    {option.title}
                                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {option.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
