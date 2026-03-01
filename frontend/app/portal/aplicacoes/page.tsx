'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { fetchPatientApplications } from '@/lib/portal-api';

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    prescribed: { label: 'Prescrito', color: 'bg-gray-100 text-gray-700', icon: '📋' },
    waiting_purchase: { label: 'Aguardando Compra', color: 'bg-amber-50 text-amber-700', icon: '🛒' },
    purchased: { label: 'Comprado', color: 'bg-blue-50 text-blue-700', icon: '✅' },
    scheduled: { label: 'Agendado', color: 'bg-cyan-50 text-cyan-700', icon: '📅' },
    administered: { label: 'Aplicado', color: 'bg-green-50 text-green-700', icon: '💉' },
    cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-700', icon: '❌' },
};

const statusOrder = ['prescribed', 'waiting_purchase', 'purchased', 'scheduled', 'administered'];

export default function AplicacoesPage() {
    const { user, loading } = usePortalAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchPatientApplications()
            .then(setApplications)
            .catch(console.error)
            .finally(() => setLoadingData(false));
    }, [user]);

    if (loading) return null;

    return (
        <>
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:ml-56 md:pb-6">
                <h1 className="text-xl font-semibold text-gray-900 mb-6">💉 Minhas Aplicações</h1>

                {loadingData ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">💉</p>
                        <p>Nenhuma aplicação registrada</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app: any) => {
                            const status = statusConfig[app.status] || statusConfig.prescribed;
                            const currentStep = statusOrder.indexOf(app.status);

                            return (
                                <div key={app.id} className="bg-white rounded-xl p-5 border border-gray-100">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{app.productName}</h3>
                                            {app.productDetails && (
                                                <p className="text-sm text-gray-500">{app.productDetails}</p>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2.5 py-1 rounded-full ${status.color}`}>
                                            {status.icon} {status.label}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    {app.status !== 'cancelled' && (
                                        <div className="flex items-center gap-1 mb-3">
                                            {statusOrder.map((step, i) => (
                                                <div
                                                    key={step}
                                                    className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-400">Dose:</span>{' '}
                                            <span className="text-gray-700">{app.quantity} {app.unit}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Via:</span>{' '}
                                            <span className="text-gray-700">{app.route}</span>
                                        </div>
                                        {app.scheduledFor && (
                                            <div>
                                                <span className="text-gray-400">Agendado:</span>{' '}
                                                <span className="text-gray-700">
                                                    {new Date(app.scheduledFor).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        )}
                                        {app.administeredAt && (
                                            <div>
                                                <span className="text-gray-400">Aplicado em:</span>{' '}
                                                <span className="text-gray-700">
                                                    {new Date(app.administeredAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        )}
                                        {app.applicationSite && (
                                            <div>
                                                <span className="text-gray-400">Local:</span>{' '}
                                                <span className="text-gray-700">{app.applicationSite}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-400 mt-3">
                                        Prescrito em {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}
