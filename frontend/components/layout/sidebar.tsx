'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, DollarSign, Smartphone, Calendar, Users, Shield,
    Share2, ClipboardList, Target, Settings, ChevronRight, ChevronLeft, Menu, Brain, Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility for class merging

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { href: '/knowledge', label: 'Cérebro (IA)', icon: Brain },
        { href: '/intercurrences', label: 'Alertas (Sentinel)', icon: Activity },
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

    return (
        <div className={cn(
            "flex flex-col h-full bg-slate-900 transition-all duration-300 ease-in-out border-r border-white/10 relative z-50",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Toggle Button - Floating on Border */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 bg-teal-600 text-white p-1 rounded-full shadow-lg hover:bg-teal-500 transition-colors z-50 border border-slate-800"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Brand */}
            <div className={cn("h-16 flex items-center border-b border-white/10 overflow-hidden whitespace-nowrap", isCollapsed ? "justify-center px-0" : "px-6")}>
                <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center text-white font-mono text-xs shrink-0">CX</div>
                    <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                        CALYX
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                {!isCollapsed && (
                    <div className="mb-4 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-in fade-in">
                        Menu
                    </div>
                )}

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative",
                                isActive
                                    ? "bg-teal-500/10 text-teal-400"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            {isActive && !isCollapsed && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-500 rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            )}
                            <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-teal-400" : "text-slate-500 group-hover:text-white")} />

                            <span className={cn("whitespace-nowrap transition-all duration-200",
                                isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                            )}>
                                {item.label}
                            </span>

                            {/* Badge Example - Only show when expanded for now, or as a dot when collapsed */}
                            {item.label === 'Pacientes' && (
                                <>
                                    {!isCollapsed ? (
                                        <span className={cn(
                                            "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                                            isActive ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-400"
                                        )}>
                                            12
                                        </span>
                                    ) : (
                                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 shadow-sm" />
                                    )}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-white/5 bg-black/20 overflow-hidden">
                <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold shrink-0 ring-2 ring-slate-800 cursor-pointer hover:ring-teal-500 transition-all">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'D'}
                    </div>

                    <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                        <p className="text-sm font-medium text-white truncate max-w-[140px] tracking-tight">
                            {user?.displayName || 'Dr. Usuario'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.email || 'admin@calyx.med'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
