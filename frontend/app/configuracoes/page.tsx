'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Stethoscope,
    FileText,
    FlaskConical,
    Apple,
    ClipboardList,
    Building2,
    CreditCard,
    Landmark,
    Tags,
    Wallet,
    Store,
    Receipt,
    Calendar,
    Palette,
    Clock,
    Users,
    LayoutTemplate,
    Settings,
    ShieldCheck,
    Activity,
    MessageSquare,
    Smartphone,
    Link as LinkIcon,
    ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// --- Configuration Data Structure ---
const SETTINGS_SECTIONS = [
    {
        title: 'Área Médica',
        description: 'Documentação e ferramentas clínicas',
        items: [
            { name: 'Documentos para Receituário', icon: FileText, href: '/configuracoes/receituario', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Planilha de Exames', icon: FlaskConical, href: '/configuracoes/exames', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Cadastro de Alimentos', icon: Apple, href: '/configuracoes/alimentos', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Formulários de Anamnese', icon: ClipboardList, href: '/configuracoes/anamnese', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Questionários de Apoio', icon: Stethoscope, href: '/configuracoes/questionarios', color: 'text-primary', bg: 'bg-primary/10' },
        ]
    },
    {
        title: 'Gestão e Finanças',
        description: 'Faturamento, convênios e contabilidade',
        items: [
            { name: 'Tabelas e Convênios', icon: Building2, href: '/configuracoes/convenios', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Procedimentos', icon: Activity, href: '/configuracoes/procedimentos', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Contas Correntes', icon: Landmark, href: '/configuracoes/bancos', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Plano de Contas', icon: Tags, href: '/configuracoes/plano-contas', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Formas de Pagamento', icon: Wallet, href: '/configuracoes/pagamentos', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Unidades/Filiais', icon: Store, href: '/configuracoes/unidades', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Nota Fiscal (NFS-e)', icon: Receipt, href: '/configuracoes/nfs-e', color: 'text-primary', bg: 'bg-primary/10' },
        ]
    },
    {
        title: 'Configurações Gerais',
        description: 'Parâmetros do sistema e agenda',
        items: [
            { name: 'Setores da Agenda', icon: Calendar, href: '/configuracoes/agenda-setores', color: 'text-orange-600', bg: 'bg-orange-50' },
            { name: 'Cores da Agenda', icon: Palette, href: '/configuracoes/agenda-cores', color: 'text-orange-600', bg: 'bg-orange-50' },
            { name: 'Tipos de Agendamento', icon: Clock, href: '/configuracoes/agenda-tipos', color: 'text-orange-600', bg: 'bg-orange-50' },
            { name: 'Usuários e Permissões', icon: Users, href: '/configuracoes/usuarios', color: 'text-orange-600', bg: 'bg-orange-50' },
            { name: 'Cabeçalho e Rodapé', icon: LayoutTemplate, href: '/configuracoes/timbrado', color: 'text-muted-foreground', bg: 'bg-muted' },
            { name: 'Parâmetros do Sistema', icon: Settings, href: '/configuracoes/parametros', color: 'text-muted-foreground', bg: 'bg-muted' },
        ]
    },
    {
        title: 'Integrações e Mensagens',
        description: 'Conectividade e automação',
        items: [
            { name: 'Configurações WABA', icon: Smartphone, href: '/configuracoes/whatsapp', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Filas de Atendimento', icon: MessageSquare, href: '/configuracoes/filas-whatsapp', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Links e Webhooks', icon: LinkIcon, href: '/configuracoes/webhooks', color: 'text-primary', bg: 'bg-primary/10' },
            { name: 'Auditoria de Eventos', icon: ShieldCheck, href: '/configuracoes/auditoria', color: 'text-muted-foreground', bg: 'bg-muted' },
        ]
    }
];

export default function SettingsHubPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredSections = SETTINGS_SECTIONS.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.items.length > 0);

    return (
        <div className="min-h-screen bg-muted/50/50 pb-20">
            {/* Header com Gradiente Sutil "Clinical Precision" */}
            <div className="bg-white border-b border-border sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto max-w-6xl px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
                            <p className="text-muted-foreground text-sm mt-1">Gerencie todos os aspectos do seu ecossistema médico.</p>
                        </div>

                        {/* Search Bar "Hero" */}
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-opacity group-focus-within:opacity-100">
                                <Search className="h-5 w-5 text-teal-500" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Buscar configuração (ex: Usuários, Agenda...)"
                                className="pl-10 h-11 bg-muted/50 border-border focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all  shadow-sm hover:border-teal-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container mx-auto max-w-6xl px-6 py-8 space-y-10">

                {filteredSections.length === 0 ? (
                    <div className="text-center py-20 opacity-60">
                        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-muted-foreground">Nenhum resultado encontrado</h3>
                        <p className="text-sm text-muted-foreground/70">Tente buscar com outro termo.</p>
                    </div>
                ) : (
                    filteredSections.map((section, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-lg font-bold text-foreground tracking-tight">{section.title}</h2>
                                <Separator className="flex-1 bg-muted" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {section.items.map((item, itemIndex) => (
                                    <Link href={item.href} key={itemIndex} className="group">
                                        <div className="h-full bg-white border border-border  p-4 hover: hover:border-teal-200/50 hover:bg-gradient-to-br hover:from-white hover:to-teal-50/30 transition-all duration-300 flex items-center gap-4 cursor-pointer relative overflow-hidden">

                                            {/* Decorative Background Icon */}
                                            <item.icon className={cn("absolute -right-4 -bottom-4 w-20 h-20 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12", item.color)} />

                                            {/* Icon Container */}
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", item.bg)}>
                                                <item.icon className={cn("w-5 h-5", item.color)} />
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground/80 text-sm group-hover:text-teal-700 transition-colors truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Configurar
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
