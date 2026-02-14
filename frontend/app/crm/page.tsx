'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Users, Cake, UserX, Star, UserPlus, Clock,
    Search, Filter, Phone, MessageSquare, Calendar,
    Gift, AlertTriangle, TrendingUp, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KanbanBoard } from '@/components/crm/kanban-board';
import { NewLeadDialog } from '@/components/crm/new-lead-dialog';
import api from '@/lib/api';
import Link from 'next/link';

interface PatientStats {
    total: number;
    vip: number;
    new: number;
    recurring: number;
    birthdaysThisMonth: number;
    newLast30Days: number;
    inactive90Days: number;
}

interface Patient {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    birthDate?: string;
    tags?: string[];
    lastVisit?: string;
    createdAt: string;
}

// MOCK DATA FOR PRESENTATION
const mockStats: PatientStats = {
    total: 1248,
    vip: 86,
    new: 42,
    recurring: 840,
    birthdaysThisMonth: 12,
    newLast30Days: 42,
    inactive90Days: 156
};

const mockBirthdays: Patient[] = [
    { id: 'b1', name: 'Ana Clara Silva', birthDate: '1990-02-15', createdAt: '2023-01-01', phone: '11999999999' },
    { id: 'b2', name: 'Carlos Eduardo', birthDate: '1985-02-20', createdAt: '2023-01-01', phone: '11988888888' },
    { id: 'b3', name: 'Mariana Costa', birthDate: '1995-02-25', createdAt: '2023-01-01', phone: '11977777777' },
];

const mockInactive: Patient[] = [
    { id: 'i1', name: 'Roberto Almeida', lastVisit: '2023-09-10', createdAt: '2022-01-01' },
    { id: 'i2', name: 'Fernanda Lima', lastVisit: '2023-08-15', createdAt: '2022-01-01' },
    { id: 'i3', name: 'João Pedro', lastVisit: '2023-07-20', createdAt: '2022-01-01' },
    { id: 'i4', name: 'Lucas Santos', lastVisit: '2023-06-05', createdAt: '2022-01-01' },
    { id: 'i5', name: 'Beatriz Oliveira', lastVisit: '2023-05-12', createdAt: '2022-01-01' },
];

export default function CRMPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: apiStats } = useQuery<PatientStats>({
        queryKey: ['patient-stats'],
        queryFn: async () => {
            try {
                const res = await api.get('/patients/stats');
                return res.data;
            } catch (e) { return null; }
        },
    });

    const stats = apiStats || mockStats;

    const { data: apiBirthdays = [] } = useQuery<Patient[]>({
        queryKey: ['patient-birthdays'],
        queryFn: async () => {
            try {
                const res = await api.get('/patients/birthdays');
                return res.data;
            } catch (e) { return []; }
        },
    });

    const birthdays = apiBirthdays.length > 0 ? apiBirthdays : mockBirthdays;

    const { data: apiInactive = [] } = useQuery<Patient[]>({
        queryKey: ['patient-inactive'],
        queryFn: async () => {
            try {
                const res = await api.get('/patients/inactive?days=90');
                return res.data;
            } catch (e) { return []; }
        },
    });

    const inactivePatients = apiInactive.length > 0 ? apiInactive : mockInactive;

    const { data: vipPatients = [] } = useQuery<Patient[]>({
        queryKey: ['patient-vip'],
        queryFn: async () => {
            try {
                const res = await api.get('/patients?tag=VIP');
                return res.data;
            } catch (e) { return []; }
        },
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const getDaysUntilBirthday = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = thisYearBirthday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
            {/* Header */}
            <div className="flex-none p-6 border-b border-border bg-background">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                            CRM — Gestão de Pacientes
                        </h1>
                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.1em] mt-1">
                            Acompanhe seus pacientes, aniversariantes e oportunidades.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <NewLeadDialog />
                        <Link href="/patients">
                            <Button variant="outline" size="sm">
                                <Users className="w-4 h-4 mr-2" />
                                Ver Todos
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-muted">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                        <TabsTrigger value="birthdays">Aniversariantes</TabsTrigger>
                        <TabsTrigger value="inactive">Inativos</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-auto ${activeTab === 'pipeline' ? 'p-2' : 'p-6'}`}>
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {/* Stats Cards — border-only, mono numbers */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {[
                                { label: 'Total', value: stats?.total || 0, icon: Users },
                                { label: 'VIP', value: stats?.vip || 0, icon: Star },
                                { label: 'Novos (30d)', value: stats?.newLast30Days || 0, icon: UserPlus },
                                { label: 'Recorrentes', value: stats?.recurring || 0, icon: TrendingUp },
                                { label: 'Aniversários', value: stats?.birthdaysThisMonth || 0, icon: Cake },
                                { label: 'Inativos', value: stats?.inactive90Days || 0, icon: UserX },
                                { label: 'Tag Novo', value: stats?.new || 0, icon: Clock },
                            ].map((stat) => (
                                <Card key={stat.label} className="border border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="mono-label">{stat.label}</p>
                                                <p className="font-mono text-2xl font-bold text-foreground">{stat.value}</p>
                                            </div>
                                            <stat.icon className="w-6 h-6 text-muted-foreground/50" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Birthdays Card */}
                            <Card className="border border-border">
                                <CardHeader className="pb-3 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-serif text-lg flex items-center gap-2 text-foreground">
                                            <Gift className="w-5 h-5 text-primary" />
                                            Aniversariantes de {currentMonth}
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('birthdays')}>
                                            Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {birthdays.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4 font-mono text-sm">Nenhum aniversariante este mês</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {birthdays.slice(0, 5).map((patient) => (
                                                <div key={patient.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0">
                                                    <Avatar className="h-10 w-10 border border-border">
                                                        <AvatarFallback className="bg-muted text-foreground text-sm font-mono">
                                                            {getInitials(patient.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate text-foreground">{patient.name}</p>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            {formatDate(patient.birthDate!)}
                                                            {getDaysUntilBirthday(patient.birthDate!) <= 7 && (
                                                                <Badge variant="secondary" className="ml-2 border border-primary/30 text-primary bg-transparent text-[10px] font-mono">
                                                                    Em {getDaysUntilBirthday(patient.birthDate!)} dias
                                                                </Badge>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Inactive Patients Card */}
                            <Card className="border border-border">
                                <CardHeader className="pb-3 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-serif text-lg flex items-center gap-2 text-foreground">
                                            <AlertTriangle className="w-5 h-5 text-destructive" />
                                            Pacientes Inativos (+90 dias)
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('inactive')}>
                                            Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {inactivePatients.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4 font-mono text-sm">Nenhum paciente inativo</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {inactivePatients.slice(0, 5).map((patient) => (
                                                <div key={patient.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors duration-150 border-b border-border/50 last:border-0">
                                                    <Avatar className="h-10 w-10 border border-border">
                                                        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-mono">
                                                            {getInitials(patient.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate text-foreground">{patient.name}</p>
                                                        <p className="font-mono text-xs text-muted-foreground">
                                                            Última visita: {patient.lastVisit ? formatDate(patient.lastVisit) : 'Nunca'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                                                            <Phone className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                                                            <MessageSquare className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'pipeline' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="h-full"
                    >
                        <KanbanBoard />
                    </motion.div>
                )}

                {activeTab === 'birthdays' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Card className="border border-border">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2 text-foreground">
                                    <Cake className="w-5 h-5 text-primary" />
                                    Aniversariantes de {currentMonth}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {birthdays.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 font-mono text-sm">Nenhum aniversariante este mês</p>
                                ) : (
                                    <div className="space-y-1">
                                        {birthdays.map((patient) => (
                                            <div key={patient.id} className="flex items-center gap-4 p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors duration-150">
                                                <Avatar className="h-12 w-12 border border-border">
                                                    <AvatarFallback className="bg-muted text-foreground font-mono">
                                                        {getInitials(patient.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{patient.name}</p>
                                                    <p className="font-mono text-sm text-muted-foreground">{formatDate(patient.birthDate!)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {patient.phone && (
                                                        <Button size="sm" variant="outline">
                                                            <Phone className="w-4 h-4 mr-1" /> Ligar
                                                        </Button>
                                                    )}
                                                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-[0.1em]">
                                                        <MessageSquare className="w-4 h-4 mr-1" /> WhatsApp
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'inactive' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Card className="border border-border">
                            <CardHeader>
                                <CardTitle className="font-serif flex items-center gap-2 text-foreground">
                                    <UserX className="w-5 h-5 text-destructive" />
                                    Pacientes Inativos (sem consulta há mais de 90 dias)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inactivePatients.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 font-mono text-sm">Nenhum paciente inativo</p>
                                ) : (
                                    <div className="space-y-1">
                                        {inactivePatients.map((patient) => (
                                            <div key={patient.id} className="flex items-center gap-4 p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors duration-150">
                                                <Avatar className="h-12 w-12 border border-border">
                                                    <AvatarFallback className="bg-muted text-muted-foreground font-mono">
                                                        {getInitials(patient.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{patient.name}</p>
                                                    <p className="font-mono text-sm text-muted-foreground">
                                                        Última visita: {patient.lastVisit ? formatDate(patient.lastVisit) : 'Nunca registrada'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/patients/${patient.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            Ver Perfil
                                                        </Button>
                                                    </Link>
                                                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs uppercase tracking-[0.1em]">
                                                        <MessageSquare className="w-4 h-4 mr-1" /> Reativar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
