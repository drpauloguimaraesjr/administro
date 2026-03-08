'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, DollarSign, Smartphone, Calendar, Users,
    Share2, ClipboardList, Target, Settings, Brain, Activity,
    Pin, PinOff, Syringe, Building2, PackageCheck
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isPinned, setIsPinned] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isExpanded = isPinned || isHovered;

    const navItems = [
        { href: '/knowledge', label: 'Cérebro (IA)', icon: Brain },
        { href: '/intercurrences', label: 'Alertas', icon: Activity },
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/agenda', label: 'Agenda', icon: Calendar },
        { href: '/patients', label: 'Pacientes', icon: Users },
        { href: '/indicacoes', label: 'Indicações', icon: Share2 },
        { href: '/questionarios', label: 'Questionários', icon: ClipboardList },
        { href: '/transactions', label: 'Financeiro', icon: DollarSign },
        { href: '/enfermagem', label: 'Enfermagem', icon: Syringe },
        { href: '/sala-procedimentos', label: 'Sala Procedimentos', icon: PackageCheck },
        { href: '/aplicacoes', label: 'Aplicações', icon: Syringe },
        { href: '/parceiros', label: 'Parceiros', icon: Building2 },
        { href: '/whatsapp', label: 'WhatsApp', icon: Smartphone },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
        { href: '/crm', label: 'CRM', icon: Target },
    ];

    const handleMouseEnter = useCallback(() => {
        if (!isPinned) setIsHovered(true);
    }, [isPinned]);

    const handleMouseLeave = useCallback(() => {
        if (!isPinned) setIsHovered(false);
    }, [isPinned]);

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "flex flex-col h-full relative z-50",
                "transition-[width] duration-200 ease-out",
                isExpanded ? "w-[220px]" : "w-[56px]"
            )}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--glass-border)',
            }}
        >
            {/* Brand */}
            <div className={cn(
                "h-14 flex items-center overflow-hidden",
                isExpanded ? "px-4 justify-between" : "px-0 justify-center"
            )}
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
                <Link href="/" className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-foreground flex items-center justify-center text-background font-mono text-[10px] font-medium tracking-wider shrink-0 rounded-lg">
                        CX
                    </div>
                    {isExpanded && (
                        <span className="font-serif text-lg font-bold text-foreground tracking-tight animate-fade-in">
                            CALYX
                        </span>
                    )}
                </Link>

                {/* Pin Button */}
                {isExpanded && (
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 animate-fade-in"
                        title={isPinned ? 'Desafixar sidebar' : 'Fixar sidebar'}
                    >
                        {isPinned ? (
                            <PinOff className="w-3.5 h-3.5" />
                        ) : (
                            <Pin className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {isExpanded && (
                    <div className="mb-3 px-4 mono-label text-muted-foreground animate-fade-in">
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
                            title={!isExpanded ? item.label : undefined}
                            className={cn(
                                "flex items-center gap-3 relative transition-all duration-200",
                                isExpanded ? "px-4 py-2.5 mx-2 rounded-lg" : "px-0 py-2.5 justify-center",
                                isActive
                                    ? "text-foreground bg-foreground/[0.06]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                            )}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-foreground rounded-full" />
                            )}

                            <Icon className={cn(
                                "w-[18px] h-[18px] shrink-0 transition-colors duration-200",
                                isActive ? "text-foreground" : ""
                            )} />

                            {isExpanded && (
                                <span className="text-[13px] font-mono font-normal tracking-wide whitespace-nowrap animate-fade-in">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div style={{ borderTop: '1px solid var(--glass-border)' }} className="overflow-hidden">
                <div className={cn(
                    "flex items-center gap-3 py-3",
                    isExpanded ? "px-4" : "justify-center px-0"
                )}>
                    <div className="w-8 h-8 bg-foreground/[0.08] border border-border flex items-center justify-center text-[11px] text-foreground font-mono font-medium shrink-0 rounded-full">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'D'}
                    </div>

                    {isExpanded && (
                        <div className="overflow-hidden min-w-0 animate-fade-in">
                            <p className="text-[13px] font-serif font-medium text-foreground truncate">
                                {user?.displayName || 'Dr. Usuario'}
                            </p>
                            <p className="text-[10px] font-mono text-muted-foreground truncate tracking-wide">
                                {user?.email || 'admin@calyx.med'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
