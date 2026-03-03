'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { auth as firebaseAuth } from '@/lib/firebase/config';
import {
    Home,
    Pill,
    Syringe,
    FileText,
    FlaskConical,
    LogOut,
    Stethoscope,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';

const navItems = [
    { href: '/portal', label: 'Início', icon: Home },
    { href: '/portal/prescricoes', label: 'Receitas', icon: Pill },
    { href: '/portal/aplicacoes', label: 'Aplicações', icon: Syringe },
    { href: '/portal/documentos', label: 'Documentos', icon: FileText },
    { href: '/portal/exames', label: 'Exames', icon: FlaskConical },
];

export function PortalNav() {
    const pathname = usePathname();
    const { user, logout } = usePortalAuth();
    const [isAlsoStaff, setIsAlsoStaff] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        async function checkStaffRole() {
            if (user && firebaseAuth?.currentUser) {
                try {
                    const tokenResult = await firebaseAuth.currentUser.getIdTokenResult();
                    if (tokenResult.claims.role !== 'patient') {
                        setIsAlsoStaff(true);
                    }
                } catch { /* silent */ }
            }
        }
        checkStaffRole();
    }, [user]);

    // Close mobile nav on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    if (!user) return null;

    return (
        <>
            {/* ===== TOP BAR ===== */}
            <header className="portal-header">
                <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <Link href="/portal" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-teal-500/20">
                                CX
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-sm font-semibold text-slate-800 tracking-tight">CALYX</span>
                                <span className="text-[10px] text-slate-400 ml-1.5 font-medium">Portal</span>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAlsoStaff && (
                            <Link
                                href="/"
                                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all"
                            >
                                <Stethoscope className="w-3.5 h-3.5" />
                                Área Médica
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* ===== MOBILE SLIDE MENU ===== */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                    <div
                        className="absolute left-0 top-16 bottom-0 w-64 bg-white shadow-2xl p-4 animate-slide-in-left"
                        onClick={e => e.stopPropagation()}
                    >
                        <nav className="space-y-1">
                            {navItems.map(item => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`portal-nav-item ${isActive ? 'portal-nav-item-active' : ''}`}
                                    >
                                        <Icon className="w-[18px] h-[18px]" />
                                        <span>{item.label}</span>
                                        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
                                    </Link>
                                );
                            })}
                        </nav>
                        {isAlsoStaff && (
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <Link href="/" className="portal-nav-item text-emerald-600">
                                    <Stethoscope className="w-[18px] h-[18px]" />
                                    <span>Área Médica</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== BOTTOM NAV (mobile) ===== */}
            <nav className="portal-bottom-nav md:hidden">
                <div className="flex justify-around items-center py-1">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${isActive
                                    ? 'text-teal-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* ===== DESKTOP SIDEBAR ===== */}
            <aside className="portal-sidebar hidden md:flex">
                <div className="p-4 flex-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 px-3">Menu</p>
                    <nav className="space-y-0.5">
                        {navItems.map(item => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`portal-nav-item ${isActive ? 'portal-nav-item-active' : ''}`}
                                >
                                    <Icon className="w-[18px] h-[18px]" />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-slate-100">
                    {isAlsoStaff && (
                        <Link href="/" className="portal-nav-item text-emerald-600 mb-2">
                            <Stethoscope className="w-[18px] h-[18px]" />
                            <span>Área Médica</span>
                        </Link>
                    )}
                    <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{user.displayName || 'Paciente'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
