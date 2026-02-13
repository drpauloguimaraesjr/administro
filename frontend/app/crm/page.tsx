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

    // Fetch stats
    const { data: apiStats } = useQuery<PatientStats>({
        queryKey: ['patient-stats'],
        queryFn: async () => {
            try {
                const res = await api.get('/patients/stats');
                return res.data;
            } catch (e) { return null; }
        },
    });

    const stats = apiStats || mockStats; // Fallback to mock

    // Fetch birthdays
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

    // Fetch inactive patients
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

    // Fetch VIP patients
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
        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-secondary/30">
            {/* Header */}
            <div className="flex-none p-6 border-b bg-white/80 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            CRM - Gestão de Pacientes
                        </h1>
                        <p className="text-sm text-slate-500">
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
                    <TabsList className="bg-slate-100">
                        <TabsTrigger value="overview">📊 Visão Geral</TabsTrigger>
                        <TabsTrigger value="pipeline">🎯 Pipeline</TabsTrigger>
                        <TabsTrigger value="birthdays">🎂 Aniversariantes</TabsTrigger>
                        <TabsTrigger value="inactive">⚠️ Inativos</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-auto ${activeTab === 'pipeline' ? 'p-2' : 'p-6'}`}>
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-xs font-medium">Total</p>
                                            <p className="text-2xl font-bold">{stats?.total || 0}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-blue-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-amber-100 text-xs font-medium">VIP</p>
                                            <p className="text-2xl font-bold">{stats?.vip || 0}</p>
                                        </div>
                                        <Star className="w-8 h-8 text-amber-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-xs font-medium">Novos (30d)</p>
                                            <p className="text-2xl font-bold">{stats?.newLast30Days || 0}</p>
                                        </div>
                                        <UserPlus className="w-8 h-8 text-green-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-xs font-medium">Recorrentes</p>
                                            <p className="text-2xl font-bold">{stats?.recurring || 0}</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-purple-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-pink-100 text-xs font-medium">Aniversários</p>
                                            <p className="text-2xl font-bold">{stats?.birthdaysThisMonth || 0}</p>
                                        </div>
                                        <Cake className="w-8 h-8 text-pink-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-red-100 text-xs font-medium">Inativos</p>
                                            <p className="text-2xl font-bold">{stats?.inactive90Days || 0}</p>
                                        </div>
                                        <UserX className="w-8 h-8 text-red-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white border-0 shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-teal-100 text-xs font-medium">Tag Novo</p>
                                            <p className="text-2xl font-bold">{stats?.new || 0}</p>
                                        </div>
                                        <Clock className="w-8 h-8 text-teal-200 opacity-80" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Birthdays Card */}
                            <Card className="border-border shadow-sm">
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                                            <Gift className="w-5 h-5 text-pink-500" />
                                            Aniversariantes de {currentMonth}
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('birthdays')}>
                                            Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {birthdays.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">Nenhum aniversariante este mês</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {birthdays.slice(0, 5).map((patient) => (
                                                <div key={patient.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                    <Avatar className="h-10 w-10 border border-pink-100">
                                                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-sm font-medium">
                                                            {getInitials(patient.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate text-gray-900">{patient.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(patient.birthDate!)}
                                                            {getDaysUntilBirthday(patient.birthDate!) <= 7 && (
                                                                <Badge variant="secondary" className="ml-2 bg-pink-100 text-pink-700 text-[10px]">
                                                                    Em {getDaysUntilBirthday(patient.birthDate!)} dias
                                                                </Badge>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Inactive Patients Card */}
                            <Card className="border-border shadow-sm">
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                            Pacientes Inativos (+90 dias)
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('inactive')}>
                                            Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {inactivePatients.length === 0 ? (
                                        <p className="text-center text-gray-500 py-4">Nenhum paciente inativo</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {inactivePatients.slice(0, 5).map((patient) => (
                                                <div key={patient.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                    <Avatar className="h-10 w-10 border border-gray-100">
                                                        <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                                            {getInitials(patient.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate text-gray-900">{patient.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Última visita: {patient.lastVisit ? formatDate(patient.lastVisit) : 'Nunca'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                                            <Phone className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
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
                        className="h-full"
                    >
                        <KanbanBoard />
                    </motion.div>
                )}

                {activeTab === 'birthdays' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <Cake className="w-5 h-5 text-pink-500" />
                                    Aniversariantes de {currentMonth}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {birthdays.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Nenhum aniversariante este mês</p>
                                ) : (
                                    <div className="space-y-2">
                                        {birthdays.map((patient) => (
                                            <div key={patient.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-pink-50 transition-colors">
                                                <Avatar className="h-12 w-12 border border-pink-100">
                                                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white font-medium">
                                                        {getInitials(patient.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{patient.name}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(patient.birthDate!)}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {patient.phone && (
                                                        <Button size="sm" variant="outline">
                                                            <Phone className="w-4 h-4 mr-1" /> Ligar
                                                        </Button>
                                                    )}
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <UserX className="w-5 h-5 text-red-500" />
                                    Pacientes Inativos (sem consulta há mais de 90 dias)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {inactivePatients.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">Nenhum paciente inativo</p>
                                ) : (
                                    <div className="space-y-2">
                                        {inactivePatients.map((patient) => (
                                            <div key={patient.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-red-50 transition-colors">
                                                <Avatar className="h-12 w-12 border border-gray-100">
                                                    <AvatarFallback className="bg-gray-200 text-gray-600 font-medium">
                                                        {getInitials(patient.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{patient.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Última visita: {patient.lastVisit ? formatDate(patient.lastVisit) : 'Nunca registrada'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/patients/${patient.id}`}>
                                                        <Button size="sm" variant="outline">
                                                            Ver Perfil
                                                        </Button>
                                                    </Link>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
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
