'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
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
                setAppointments(appts);
                setApplications(apps);
                setPrescriptions(rxs);
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

    const now = new Date();
    const pastAppts = appointments.filter(a => new Date(a.date) <= now && a.status === 'completed');
    const nextAppt = appointments.find(a => new Date(a.date) > now && (a.status === 'confirmed' || a.status === 'pending'));
    const lastAppt = pastAppts[0]; // já vem ordenado desc
    const activeImplants = applications.filter(a => a.status === 'administered');
    const scheduledApps = applications.filter(a => a.status === 'scheduled');

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
        <>
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:ml-56 md:pb-6">
                {/* Greeting */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Olá, {profile?.name?.split(' ')[0] || 'Paciente'} 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Sua jornada de saúde com a clínica</p>
                </div>

                {loadingData ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* === PRÓXIMA CONSULTA === */}
                        {nextAppt && (
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 text-white mb-6 shadow-lg shadow-blue-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">📅</span>
                                    <div>
                                        <p className="text-white/70 text-xs uppercase tracking-wide">Próxima Consulta</p>
                                        <p className="text-xl font-semibold">{formatDate(nextAppt.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-sm text-white/80">
                                    <span>🕐 {nextAppt.startTime}</span>
                                    <span>• {typeLabel[nextAppt.type] || 'Consulta'}</span>
                                </div>
                                {nextAppt.notes && (
                                    <p className="mt-2 text-sm text-white/70 bg-white/10 rounded-xl px-3 py-2">
                                        {nextAppt.notes}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* === ÚLTIMA CONSULTA === */}
                        {lastAppt && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">✅</div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Última Consulta</p>
                                        <p className="font-medium text-gray-900">{formatDate(lastAppt.date)} às {lastAppt.startTime}</p>
                                        <p className="text-sm text-gray-500">{typeLabel[lastAppt.type] || 'Consulta'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === LINHA DO TEMPO DE CONSULTAS === */}
                        {pastAppts.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                                    Histórico de Consultas
                                </h2>
                                <div className="relative">
                                    {/* Linha vertical */}
                                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-gray-200" />

                                    <div className="space-y-4">
                                        {pastAppts.map((appt, i) => (
                                            <div key={appt.id} className="relative flex items-start gap-4 pl-2">
                                                {/* Dot */}
                                                <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${i === 0
                                                        ? 'bg-blue-500 border-blue-500 text-white'
                                                        : 'bg-white border-gray-300 text-gray-400'
                                                    }`}>
                                                    {i === 0 ? '✓' : (pastAppts.length - i)}
                                                </div>

                                                {/* Content */}
                                                <div className="bg-white rounded-xl p-4 border border-gray-100 flex-1 hover:shadow-sm transition-shadow">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-gray-900">{formatDate(appt.date)}</p>
                                                        <span className="text-xs text-gray-400">{appt.startTime}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-0.5">{typeLabel[appt.type] || 'Consulta'}</p>
                                                    {appt.notes && (
                                                        <p className="text-xs text-gray-400 mt-1">{appt.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Próxima (futuro) */}
                                        {nextAppt && (
                                            <div className="relative flex items-start gap-4 pl-2">
                                                <div className="relative z-10 w-7 h-7 rounded-full border-2 border-dashed border-blue-400 bg-blue-50 flex items-center justify-center text-xs text-blue-500 shrink-0">
                                                    ⏳
                                                </div>
                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex-1">
                                                    <p className="font-medium text-blue-700">Próxima: {formatDate(nextAppt.date)}</p>
                                                    <p className="text-sm text-blue-500">{nextAppt.notes || typeLabel[nextAppt.type]}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === IMPLANTES HORMONAIS ATIVOS === */}
                        {activeImplants.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
                                    💉 Implantes Hormonais Ativos
                                </h2>
                                <div className="space-y-3">
                                    {activeImplants.map((impl) => (
                                        <div key={impl.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{impl.productName}</h3>
                                                    <p className="text-sm text-gray-500">{impl.productDetails}</p>
                                                </div>
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                                    Ativo
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Quantidade:</span>{' '}
                                                    <span className="text-gray-700 font-medium">{impl.quantity} {impl.unit}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Via:</span>{' '}
                                                    <span className="text-gray-700">{impl.route}</span>
                                                </div>
                                                {impl.manufacturer && (
                                                    <div>
                                                        <span className="text-gray-400">Fabricante:</span>{' '}
                                                        <span className="text-gray-700">{impl.manufacturer}</span>
                                                    </div>
                                                )}
                                                {impl.batchNumber && (
                                                    <div>
                                                        <span className="text-gray-400">Lote:</span>{' '}
                                                        <span className="text-gray-700 font-mono text-xs">{impl.batchNumber}</span>
                                                    </div>
                                                )}
                                                {impl.batchExpiration && (
                                                    <div>
                                                        <span className="text-gray-400">Validade:</span>{' '}
                                                        <span className="text-gray-700">{formatDateShort(impl.batchExpiration)}</span>
                                                    </div>
                                                )}
                                                {impl.applicationSite && (
                                                    <div>
                                                        <span className="text-gray-400">Local:</span>{' '}
                                                        <span className="text-gray-700">{impl.applicationSite}</span>
                                                    </div>
                                                )}
                                                {impl.administeredAt && (
                                                    <div className="col-span-2">
                                                        <span className="text-gray-400">Aplicado em:</span>{' '}
                                                        <span className="text-gray-700">
                                                            {new Date(impl.administeredAt).toLocaleDateString('pt-BR', {
                                                                day: '2-digit', month: 'long', year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-gray-400 ml-1">por {impl.administeredBy}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* === PRÓXIMA APLICAÇÃO AGENDADA === */}
                        {scheduledApps.length > 0 && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 mb-8">
                                <h3 className="font-medium text-amber-900 mb-2">⏳ Próximas Aplicações Agendadas</h3>
                                {scheduledApps.map(app => (
                                    <div key={app.id} className="flex items-center gap-3 mt-2">
                                        <span className="text-lg">💉</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{app.productName} — {app.quantity} {app.unit}</p>
                                            {app.scheduledFor && (
                                                <p className="text-xs text-amber-700">
                                                    {new Date(app.scheduledFor).toLocaleDateString('pt-BR', {
                                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* === ATALHOS RÁPIDOS === */}
                        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Acesso rápido</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { href: '/portal/prescricoes', icon: '💊', label: 'Receitas', count: prescriptions.length },
                                { href: '/portal/aplicacoes', icon: '💉', label: 'Aplicações', count: applications.length },
                                { href: '/portal/documentos', icon: '📄', label: 'Documentos' },
                                { href: '/portal/exames', icon: '🔬', label: 'Exames' },
                            ].map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{item.label}</p>
                                    {item.count !== undefined && (
                                        <p className="text-xs text-gray-400">{item.count} itens</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
