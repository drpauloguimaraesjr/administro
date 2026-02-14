'use client';

import React from 'react';
import { AnalyticsCharts } from '@/components/crm/analytics-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock Data for Analytics
const MOCK_DATA = {
    stats: [
        { title: 'Total de Leads', value: '1,248', change: '+12%', trend: 'up', icon: Users },
        { title: 'Taxa de Conversão', value: '3.2%', change: '-0.4%', trend: 'down', icon: Activity },
        { title: 'Receita Estimada', value: 'R$ 284k', change: '+24%', trend: 'up', icon: DollarSign },
        { title: 'Meta Mensal', value: '85%', change: '+5%', trend: 'up', icon: Target },
    ],
    charts: {
        leadsByStage: [
            { name: 'Novos', value: 400 },
            { name: 'Contatados', value: 300 },
            { name: 'Qualificados', value: 300 },
            { name: 'Agendados', value: 200 },
            { name: 'Convertidos', value: 278 },
            { name: 'Perdidos', value: 189 },
        ],
        leadsBySource: [
            { name: 'WhatsApp', value: 400 },
            { name: 'Instagram', value: 300 },
            { name: 'Google', value: 300 },
            { name: 'Indicação', value: 200 },
        ],
        revenueOverTime: [
            { month: 'Jan', value: 12000 },
            { month: 'Fev', value: 19000 },
            { month: 'Mar', value: 15000 },
            { month: 'Abr', value: 24000 },
            { month: 'Mai', value: 32000 },
            { month: 'Jun', value: 45000 },
        ]
    }
};

export default function CRMAnalyticsPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                        <p className="text-slate-500">Visão geral da performance do seu pipeline.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {MOCK_DATA.stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                                        {stat.trend === 'up' ? (
                                            <ArrowUpRight className="text-green-500 w-4 h-4 mr-1" />
                                        ) : (
                                            <ArrowDownRight className="text-red-500 w-4 h-4 mr-1" />
                                        )}
                                        <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                            {stat.change}
                                        </span>
                                        <span className="ml-1">vs mês passado</span>
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <AnalyticsCharts data={MOCK_DATA.charts} />
            </div>
        </div>
    );
}
