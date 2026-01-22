'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/responder');

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen w-full bg-[var(--gray-50)] grid md:grid-cols-[240px_1fr] grid-rows-[auto_1fr] overflow-hidden">
            {/* Header Mobile (Hidden on desktop, logic handled inside Header/Sidebar usually, but for grid we can keep simple) */}
            {/* Desktop Layout */}

            {/* Sidebar - Fixa à esquerda */}
            <aside className="hidden md:block row-span-2 border-r border-[var(--gray-200)] bg-white overflow-y-auto">
                <Sidebar />
            </aside>

            {/* Header - Fixo no topo */}
            <header className="h-16 border-b border-[var(--gray-200)] bg-white px-6 flex items-center justify-between shadow-sm z-10">
                <Header />
            </header>

            {/* Conteúdo Principal - Com scroll e padding */}
            <main className="overflow-y-auto p-8 relative">
                {children}
            </main>
        </div>
    );
}
