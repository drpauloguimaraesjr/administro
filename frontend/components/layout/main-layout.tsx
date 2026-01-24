'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';

import { cn } from '@/lib/utils';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/responder');
    // Se estiver em uma página de detalhes do paciente (Prontuário), remove o padding padrão
    const isMedicalRecord = pathname.startsWith('/patients/') && pathname.split('/').length > 2;

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen w-full bg-background grid md:grid-cols-[260px_1fr] grid-rows-[auto_1fr] overflow-hidden font-sans">
            {/* Header Mobile (Hidden on desktop, logic handled inside Header/Sidebar usually, but for grid we can keep simple) */}
            {/* Desktop Layout */}

            {/* Sidebar - Fixa à esquerda (DARK RAIL IDENTITY) */}
            <aside className="hidden md:block row-span-2 border-r border-slate-800 bg-[#0F172A] text-slate-300 overflow-y-auto z-20 shadow-xl">
                <Sidebar />
            </aside>

            {/* Header - Fixo no topo */}
            <header className="h-16 border-b border-border/60 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10 sticky top-0">
                <Header />
            </header>

            {/* Conteúdo Principal - Com scroll e padding */}
            <main className={cn("overflow-y-auto relative w-full", isMedicalRecord ? "p-0" : "p-6 md:p-8")}>
                <div className="mx-auto max-w-7xl h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
