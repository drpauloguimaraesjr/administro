'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { fetchPatientProfile, fetchPatientPrescriptions, fetchPatientApplications } from '@/lib/portal-api';
import Link from 'next/link';

export default function PortalDashboard() {
    const { user, patientId, loading } = usePortalAuth();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ prescriptions: 0, applications: 0, nextApplication: '' });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user || !patientId) return;

        const load = async () => {
            try {
                const [profileData, prescriptions, applications] = await Promise.all([
                    fetchPatientProfile(),
                    fetchPatientPrescriptions(),
                    fetchPatientApplications(),
                ]);

                setProfile(profileData);

                const scheduled = applications.find((a: any) => a.status === 'scheduled');
                setStats({
                    prescriptions: prescriptions.length,
                    applications: applications.length,
                    nextApplication: scheduled?.scheduledFor || '',
                });
            } catch (error) {
                console.error('Erro ao carregar dados do portal:', error);
            } finally {
                setLoadingData(false);
            }
        };

        load();
    }, [user, patientId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <>
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:ml-56 md:pb-6">
                {/* Greeting */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Olá, {profile?.name?.split(' ')[0] || 'Paciente'} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Aqui estão seus registros médicos</p>
                </div>

                {/* Stats Cards */}
                {loadingData ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
                                <div className="h-8 bg-gray-200 rounded w-12" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <Link href="/portal/prescricoes" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Receitas</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.prescriptions}</p>
                            <p className="text-xs text-blue-500 mt-2 group-hover:underline">Ver todas →</p>
                        </Link>

                        <Link href="/portal/aplicacoes" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aplicações</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
                            <p className="text-xs text-green-500 mt-2 group-hover:underline">Ver todas →</p>
                        </Link>

                        <Link href="/portal/exames" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all group col-span-2 md:col-span-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Exames</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">Enviar PDF</p>
                            <p className="text-xs text-amber-500 mt-2 group-hover:underline">Enviar exame →</p>
                        </Link>
                    </div>
                )}

                {/* Next Application Alert */}
                {stats.nextApplication && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100 mb-8">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💉</span>
                            <div>
                                <p className="font-medium text-gray-900">Próxima aplicação agendada</p>
                                <p className="text-sm text-blue-600">
                                    {new Date(stats.nextApplication).toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Links */}
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Acesso rápido</h2>
                <div className="space-y-2">
                    {[
                        { href: '/portal/prescricoes', icon: '💊', label: 'Minhas Receitas', desc: 'Prescrições e medicamentos' },
                        { href: '/portal/aplicacoes', icon: '💉', label: 'Aplicações', desc: 'Medicamentos injetáveis e status' },
                        { href: '/portal/documentos', icon: '📄', label: 'Documentos', desc: 'Atestados e laudos' },
                        { href: '/portal/exames', icon: '🔬', label: 'Enviar Exames', desc: 'Upload de PDFs para o médico' },
                    ].map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <span className="text-gray-300">›</span>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}
