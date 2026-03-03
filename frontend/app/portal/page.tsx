'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { Timeline } from '@/components/portal/timeline';
import { HealthPanel } from '@/components/portal/HealthPanel';
import {
    fetchPatientProfile,
    fetchPatientPrescriptions,
    fetchPatientApplications,
    fetchPatientAppointments,
} from '@/lib/portal-api';
import Link from 'next/link';

export default function PortalDashboard() {
    const { user, patientId, loading } = usePortalAuth();
    const [profile, setProfile] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user || !patientId) return;

        const load = async () => {
            try {
                const [profileData, appts, apps, rxs] = await Promise.all([
                    fetchPatientProfile(),
                    fetchPatientAppointments(),
                    fetchPatientApplications(),
                    fetchPatientPrescriptions(),
                ]);
                setProfile(profileData);
                setAppointments(appts || []);
                setApplications(apps || []);
                setPrescriptions(rxs || []);
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const now = new Date();
    const pastAppts = appointments.filter(a => new Date(a.date) <= now && a.status === 'completed');
    const nextAppt = appointments.find(a => new Date(a.date) > now && (a.status === 'confirmed' || a.status === 'pending'));
    const lastAppt = pastAppts[0]; // já vem ordenado desc
    const activeImplants = applications.filter(a => a.status === 'administered');
    const scheduledApps = applications.filter(a => a.status === 'scheduled');

    // Mapeamento para a Timeline
    const timelineEvents = [
        ...appointments.map(a => ({
            id: a.id,
            date: a.date,
            title: a.type === 'first_visit' ? 'Primeira Consulta' : (a.type === 'return' ? 'Retorno' : 'Consulta'),
            type: 'appointment' as const,
            status: a.status,
            details: a.notes,
        })),
        ...applications.map(a => ({
            id: a.id,
            date: (a.administeredAt || a.scheduledFor || a.createdAt).split('T')[0],
            title: a.productName,
            type: 'application' as const,
            status: a.status,
            details: `${a.quantity} ${a.unit} • ${a.route}`,
        }))
    ];

    const typeLabel: Record<string, string> = {
        first_visit: 'Primeira Consulta',
        return: 'Retorno',
        evaluation: 'Avaliação',
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
        });

    const formatDateShort = (dateStr: string) =>
        new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short',
        });

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-8 pb-24 md:ml-64 lg:ml-72 md:pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                Paciente Premium
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Olá, {profile?.name?.split(' ')[0] || 'Paciente'}
                        </h1>
                        <p className="text-slate-500 font-medium">Bem-vindo à sua jornada de saúde personalizada.</p>
                    </div>
                </div>

                {loadingData ? (
                    <div className="space-y-6">
                        <div className="h-48 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-32 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                            <div className="h-32 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Health Panel & Timeline */}
                        <div className="space-y-8 mb-10">
                            <section className="bg-white border border-slate-100/50 rounded-[32px] p-6 shadow-sm shadow-slate-200/20 overflow-hidden">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        🚀 Sua Jornada
                                    </h2>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Arraste para navegar</span>
                                </div>
                                <Timeline events={timelineEvents} />
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-6 px-1">
                                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Status de Saúde</h2>
                                </div>
                                <HealthPanel />
                            </section>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* === PRÓXIMA CONSULTA === */}
                            {nextAppt ? (
                                <div className="group bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-7 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl">📅</div>
                                            <div>
                                                <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">Agendado</p>
                                                <p className="text-lg font-bold">{formatDate(nextAppt.date)}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                                                {nextAppt.startTime} • {typeLabel[nextAppt.type] || 'Consulta'}
                                            </div>
                                            {nextAppt.notes && (
                                                <p className="text-xs text-white/70 italic leading-relaxed bg-black/5 rounded-xl p-3 border border-white/5">
                                                    "{nextAppt.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-100 rounded-[32px] p-7 flex flex-col items-center justify-center text-center">
                                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-2xl mb-4">🗓️</div>
                                    <p className="text-slate-900 font-bold">Sem agendamentos</p>
                                    <p className="text-slate-400 text-xs mt-1">Sua saúde está em dia. Fique de olho na timeline!</p>
                                </div>
                            )}

                            {/* === ÚLTIMA CONSULTA === */}
                            {lastAppt && (
                                <div className="bg-white border border-slate-100 rounded-[32px] p-7 shadow-sm shadow-slate-200/20">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl text-green-600">✨</div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Último encontro</p>
                                            <p className="text-slate-900 font-bold text-lg">{formatDate(lastAppt.date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">{typeLabel[lastAppt.type] || 'Consulta'}</span>
                                        <Link href="/portal/documentos" className="text-xs font-bold text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4">Ver Resumo</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* === IMPLANTES HORMONAIS ATIVOS === */}
                        {activeImplants.length > 0 && (
                            <section className="mb-10">
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        💉 Implantes Ativos
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {activeImplants.map((impl) => (
                                        <div key={impl.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm shadow-slate-200/20 hover:border-blue-100 transition-colors">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">💉</div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{impl.productName}</h3>
                                                        <p className="text-xs font-medium text-slate-400">{impl.productDetails}</p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-green-500/20">
                                                    Ativo
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-slate-50 text-[11px]">
                                                <div className="bg-slate-50/50 rounded-xl p-3">
                                                    <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Dose</span>
                                                    <span className="text-slate-900 font-bold">{impl.quantity} {impl.unit}</span>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-xl p-3">
                                                    <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Via</span>
                                                    <span className="text-slate-900 font-bold">{impl.route}</span>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-xl p-3">
                                                    <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Aplicação</span>
                                                    <span className="text-slate-900 font-bold">{new Date(impl.administeredAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="bg-slate-50/50 rounded-xl p-3">
                                                    <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Local</span>
                                                    <span className="text-slate-900 font-bold">{impl.applicationSite || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* === QUICK ACCESS === */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 px-2">Menu Rápido</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { href: '/portal/prescricoes', icon: '💊', label: 'Receitas', color: 'from-amber-400 to-orange-500' },
                                    { href: '/portal/aplicacoes', icon: '💉', label: 'Aplicações', color: 'from-blue-400 to-indigo-500' },
                                    { href: '/portal/documentos', icon: '📄', label: 'Documentos', color: 'from-slate-400 to-slate-600' },
                                    { href: '/portal/exames', icon: '🔬', label: 'Exames', color: 'from-cyan-400 to-blue-500' },
                                ].map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group bg-white rounded-[28px] p-6 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-center relative overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                                        <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">{item.icon}</div>
                                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
