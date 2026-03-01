'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { fetchPatientPrescriptions } from '@/lib/portal-api';

export default function PrescricoesPage() {
    const { user, loading } = usePortalAuth();
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchPatientPrescriptions()
            .then(setPrescriptions)
            .catch(console.error)
            .finally(() => setLoadingData(false));
    }, [user]);

    if (loading) return null;

    const typeLabel = (type: string) => type === 'controlada' ? 'Controlada' : 'Simples';
    const typeBadge = (type: string) =>
        type === 'controlada'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-blue-50 text-blue-700 border-blue-200';

    return (
        <>
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:ml-56 md:pb-6">
                <h1 className="text-xl font-semibold text-gray-900 mb-6">💊 Minhas Receitas</h1>

                {loadingData ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">💊</p>
                        <p>Nenhuma receita encontrada</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {prescriptions.map((rx: any) => (
                            <div key={rx.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{rx.title || 'Receita'}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(rx.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${typeBadge(rx.type)}`}>
                                        {typeLabel(rx.type)}
                                    </span>
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/portal/prescriptions/${rx.id}/pdf`}
                                        target="_blank"
                                        rel="noopener"
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        📥 Download PDF
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
