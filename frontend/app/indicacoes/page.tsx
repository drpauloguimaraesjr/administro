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

export default function IndicacoesPage() {
    const { data: patients = [] } = useQuery({
        queryKey: ['all-patients'],
        queryFn: async () => {
            const res = await api.get('/patients');
            return res.data;
        },
    });

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

            // Count referrers
            if (patient.referredById && patient.referredByName) {
                const existing = acc.topReferrers.find((r) => r.id === patient.referredById);
                if (existing) {
                    existing.count++;
                } else {
                    acc.topReferrers.push({
                        id: patient.referredById,
                        name: patient.referredByName,
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
        indication: 'bg-teal-500',
        google: 'bg-blue-500',
        instagram: 'bg-pink-500',
        facebook: 'bg-indigo-500',
        friend: 'bg-yellow-500',
        other: 'bg-gray-500',
        unknown: 'bg-gray-400',
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard de Indicações</h1>
                            <p className="text-muted-foreground">Acompanhe como seus pacientes chegam até você</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
                                    <Users className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stats.totalPatients}</p>
                                    <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                                    <Share2 className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stats.totalReferrals}</p>
                                    <p className="text-sm text-muted-foreground">Por Indicação</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                                    <p className="text-sm text-muted-foreground">Taxa de Indicação</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Canais de Aquisição */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Canais de Aquisição</h2>
                            <div className="space-y-3">
                                {Object.entries(stats.bySource)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([source, count]) => {
                                        const percentage = Math.round((count / stats.totalPatients) * 100);
                                        return (
                                            <div key={source}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{sourceLabels[source] || source}</span>
                                                    <span className="font-medium">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
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
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' :
                                                        index === 1 ? 'text-gray-400' :
                                                            index === 2 ? 'text-amber-600' :
                                                                'text-muted-foreground'
                                                    }`}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                                </span>
                                                <span className="font-medium">{referrer.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-teal-600 font-bold">{referrer.count}</span>
                                                <span className="text-sm text-muted-foreground">indicações</span>
                                                <Link href={`/patients/${referrer.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Referrals */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Últimas Indicações</h2>
                        {patients.filter((p: Patient) => p.referralSource === 'indication').length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Nenhuma indicação registrada ainda
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {patients
                                    .filter((p: Patient) => p.referralSource === 'indication')
                                    .slice(0, 10)
                                    .map((patient: Patient) => (
                                        <div
                                            key={patient.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{patient.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Indicado por: {patient.referredByName || 'Não informado'}
                                                </p>
                                            </div>
                                            <Link href={`/patients/${patient.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Ver Perfil
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
