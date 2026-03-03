'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Portal Login — redireciona para o login unificado.
 * Mantido como rota standalone para links de WhatsApp e futuro app do paciente.
 * Quando virar app separado, este arquivo volta a ter seu próprio formulário.
 */
export default function PortalLoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex items-center gap-3 text-muted-foreground">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="font-mono text-sm">Redirecionando...</span>
            </div>
        </div>
    );
}
