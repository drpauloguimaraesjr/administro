'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = pathname === '/login' || pathname === '/register' || pathname.startsWith('/responder');
    const isMedicalRecord = pathname.startsWith('/patients/') && pathname.split('/').length > 2;

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen w-full bg-background flex overflow-hidden font-mono">
            {/* Sidebar — Charcoal Rail (auto-width via sidebar component) */}
            <aside className="hidden md:flex shrink-0 z-20">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header — Minimal, no blur */}
                <header className="h-14 border-b border-border bg-background px-6 flex items-center justify-between z-10 shrink-0">
                    <Header />
                </header>

                {/* Content — With scroll and padding */}
                <main className={cn("flex-1 overflow-y-auto relative", isMedicalRecord ? "p-0" : "p-6 md:p-8")}>
                    <div className="w-full h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
