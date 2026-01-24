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
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center text-white font-mono text-xs">CX</div>
                    <span>CALYX</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "bg-teal-500/10 text-teal-400"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-500 rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            )}
                            <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-teal-400" : "text-slate-500 group-hover:text-white")} />
                            <span>{item.label}</span>

                            {/* Badge opcional exemplo - Pacientes */}
                            {item.label === 'Pacientes' && (
                                <span className={cn(
                                    "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    isActive ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-400"
                                )}>
                                    12
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Mini Profile if needed or just version */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'D'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.displayName || user?.email || 'Dr. Usuario'}</p>
                        <p className="text-xs text-slate-500 truncate">Sessão Ativa</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
