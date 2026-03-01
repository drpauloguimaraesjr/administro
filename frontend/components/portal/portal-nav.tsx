'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';

const navItems = [
    { href: '/portal', label: 'Início', icon: '🏠' },
    { href: '/portal/prescricoes', label: 'Receitas', icon: '💊' },
    { href: '/portal/aplicacoes', label: 'Aplicações', icon: '💉' },
    { href: '/portal/documentos', label: 'Documentos', icon: '📄' },
    { href: '/portal/exames', label: 'Exames', icon: '🔬' },
];

export function PortalNav() {
    const pathname = usePathname();
    const { user, logout } = usePortalAuth();

    if (!user) return null;

    return (
        <>
            {/* Top bar */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                            C
                        </div>
                        <span className="text-sm font-medium text-gray-900">Portal do Paciente</span>
                    </div>
                    <button
                        onClick={logout}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Bottom nav (mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-50 md:hidden">
                <div className="flex justify-around py-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop sidebar */}
            <aside className="hidden md:block fixed left-0 top-14 w-56 h-[calc(100vh-3.5rem)] bg-white/60 backdrop-blur-lg border-r border-gray-200 p-4">
                <nav className="space-y-1">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
