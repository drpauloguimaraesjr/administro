'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, DollarSign, Smartphone, Calendar, Users, Shield,
    Share2, ClipboardList, Target, Settings, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/agenda', label: 'Agenda', icon: Calendar },
        { href: '/patients', label: 'Pacientes', icon: Users },
        { href: '/indicacoes', label: 'Indicações', icon: Share2 },
        { href: '/questionarios', label: 'Questionários', icon: ClipboardList },
        { href: '/transactions', label: 'Financeiro', icon: DollarSign },
        { href: '/whatsapp', label: 'WhatsApp', icon: Smartphone },
        { href: '/crm', label: 'CRM', icon: Target },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ];

    if (user) {
        // Admin opcional se já tem configurações
        // navItems.push({ href: '/admin', label: 'Admin', icon: Shield });
    }

    return (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--gray-200)]">
                <Link href="/" className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                    {/* Pode adicionar logo aqui */}
                    CALYX
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full" />
                            )}
                            <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600")} />
                            <span>{item.label}</span>

                            {/* Badge opcional exemplo - Pacientes */}
                            {item.label === 'Pacientes' && (
                                <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    12
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Mini Profile if needed or just version */}
            <div className="p-4 border-t border-[var(--gray-200)]">
                <p className="text-xs text-gray-400 text-center">v0.2.0 • Calyx System</p>
            </div>
        </div>
    );
}
