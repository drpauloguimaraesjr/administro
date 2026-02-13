'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, ArrowRight, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Link from 'next/link';

interface Patient {
    id: string;
    name: string;
    referralSource?: string;
    referredById?: string;
    referredByName?: string;
    createdAt?: string;
}

interface ReferralStats {
    totalPatients: number;
    totalReferrals: number;
    conversionRate: number;
    bySource: { [key: string]: number };
    topReferrers: { id: string; name: string; count: number }[];
}

// MOCK DATA FOR PRESENTATION
const mockPatients: Patient[] = [
    ...Array(12).fill(null).map((_, i) => ({ id: `p${i}`, name: `Paciente Indicação ${i + 1}`, referralSource: 'indication', referredByName: i % 2 === 0 ? 'Dr. Silva' : 'Clínica Bem Estar' })),
    ...Array(10).fill(null).map((_, i) => ({ id: `g${i}`, name: `Paciente Google ${i + 1}`, referralSource: 'google' })),
    ...Array(8).fill(null).map((_, i) => ({ id: `i${i}`, name: `Paciente Instagram ${i + 1}`, referralSource: 'instagram' })),
    ...Array(5).fill(null).map((_, i) => ({ id: `o${i}`, name: `Paciente Outro ${i + 1}`, referralSource: 'other' })),
];

export default function IndicacoesPage() {
    const { data: apiPatients = [] } = useQuery({
        queryKey: ['all-patients'],
        queryFn: async () => {
            try {
                const res = await api.get('/patients');
                return res.data;
            } catch (e) {
                return [];
            }
        },
    });

    // USE MOCK DATA IF API IS EMPTY (FOR PRESENTATION)
    const patients = apiPatients.length > 0 ? apiPatients : mockPatients;

    // Calculate stats
    const stats: ReferralStats = patients.reduce(
        (acc: ReferralStats, patient: Patient) => {
            acc.totalPatients++;

            // Count by source
            const source = patient.referralSource || 'unknown';
            acc.bySource[source] = (acc.bySource[source] || 0) + 1;

            if (source === 'indication') {
                acc.totalReferrals++;
            }

            // Count referrers (Mock logic enhancement)
            const refName = patient.referredByName || (patient.referralSource === 'indication' ? 'Indicação Anônima' : null);

            if (refName) {
                const existing = acc.topReferrers.find((r) => r.name === refName);
                if (existing) {
                    existing.count++;
                } else {
                    acc.topReferrers.push({
                        id: patient.id, // Mock ID
                        name: refName,
                        count: 1,
                    });
                }
            }

            return acc;
        },
        {
            totalPatients: 0,
            totalReferrals: 0,
            conversionRate: 0,
            bySource: {},
            topReferrers: [],
        }
    );

    // Calculate conversion rate
    stats.conversionRate = stats.totalPatients > 0
        ? Math.round((stats.totalReferrals / stats.totalPatients) * 100)
        : 0;

    // Sort top referrers
    stats.topReferrers.sort((a, b) => b.count - a.count);

    const sourceLabels: { [key: string]: string } = {
        indication: 'Indicação',
        google: 'Google',
        instagram: 'Instagram',
        facebook: 'Facebook',
        friend: 'Amigo/Familiar',
        other: 'Outro',
        unknown: 'Não informado',
    };

    const sourceColors: { [key: string]: string } = {
        indication: 'bg-emerald-500',
        google: 'bg-blue-500',
        instagram: 'bg-pink-500',
        facebook: 'bg-indigo-500',
        friend: 'bg-yellow-500',
        other: 'bg-gray-500',
        unknown: 'bg-gray-400',
    };

    return (
        // CLEAN BACKGROUND - NO DARK MODE HARDCODING
        <main className="min-h-screen bg-secondary/30">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Indicações</h1>
                            <p className="text-muted-foreground">Acompanhe como seus pacientes chegam até você</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl shadow-sm border border-border p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 rounded-lg">
                                    <Users className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                                    <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl shadow-sm border border-border p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 rounded-lg">
                                    <Share2 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalReferrals}</p>
                                    <p className="text-sm text-muted-foreground">Por Indicação</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl shadow-sm border border-border p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                                    <p className="text-sm text-muted-foreground">Taxa de Indicação</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Canais de Aquisição */}
                        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">Canais de Aquisição</h2>
                            <div className="space-y-3">
                                {Object.entries(stats.bySource)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([source, count]) => {
                                        const percentage = Math.round((count / stats.totalPatients) * 100);
                                        return (
                                            <div key={source}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-700">{sourceLabels[source] || source}</span>
                                                    <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${sourceColors[source] || 'bg-gray-500'} transition-all`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Top Indicadores */}
                        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                <Award className="w-5 h-5 text-yellow-500" />
                                Top Indicadores
                            </h2>
                            {stats.topReferrers.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    Nenhuma indicação registrada ainda
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.topReferrers.slice(0, 5).map((referrer, index) => (
                                        <div
                                            key={referrer.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' :
                                                    index === 1 ? 'text-gray-400' :
                                                        index === 2 ? 'text-amber-600' :
                                                            'text-muted-foreground'
                                                    }`}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                                </span>
                                                <span className="font-medium text-gray-800">{referrer.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-600 font-bold">{referrer.count}</span>
                                                <span className="text-xs text-muted-foreground">indicações</span>
                                                {/* <Link href={`/patients/${referrer.id}`}> 
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </Link> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Referrals */}
                    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Últimas Indicações</h2>
                        <div className="space-y-3">
                            {patients
                                .filter((p: Patient) => p.referralSource === 'indication')
                                .slice(0, 5)
                                .map((patient: Patient, i) => (
                                    <div
                                        key={patient.id || i}
                                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{patient.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Indicado por: <span className="text-emerald-600 font-medium">{patient.referredByName || 'Clínica Parceira'}</span>
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
