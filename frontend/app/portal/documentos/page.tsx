'use client';

import { useEffect, useState } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { fetchPatientDocuments } from '@/lib/portal-api';

export default function DocumentosPage() {
    const { user, loading } = usePortalAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchPatientDocuments()
            .then(setDocuments)
            .catch(console.error)
            .finally(() => setLoadingData(false));
    }, [user]);

    if (loading) return null;

    const typeIcon = (type: string) => {
        switch (type) {
            case 'atestado': return '📋';
            case 'receita': return '💊';
            case 'laudo': return '📊';
            default: return '📄';
        }
    };

    return (
        <>
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:ml-56 md:pb-6">
                <h1 className="text-xl font-semibold text-gray-900 mb-6">📄 Documentos Médicos</h1>

                {loadingData ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">📄</p>
                        <p>Nenhum documento encontrado</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc: any) => (
                            <div key={doc.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{typeIcon(doc.type)}</span>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{doc.title || doc.name || 'Documento'}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(doc.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {doc.url && (
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                        >
                                            📥 Baixar
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
