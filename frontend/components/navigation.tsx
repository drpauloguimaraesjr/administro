'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, DollarSign, Smartphone, Calendar, Users, Shield, LogOut, Share2, ClipboardList, Target, Settings, Activity, Brain, Bot, Package, Receipt } from 'lucide-react';
import { useAuth } from './auth/auth-provider';
import { Button } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/knowledge', label: 'Cérebro', icon: <Brain className="w-4 h-4 text-purple-500" /> },
    { href: '/intercurrences', label: 'Alertas', icon: <Activity className="w-4 h-4 text-red-500" /> },
    { href: '/', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: '/agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
    { href: '/patients', label: 'Pacientes', icon: <Users className="w-4 h-4" /> },
    { href: '/indicacoes', label: 'Indicações', icon: <Share2 className="w-4 h-4" /> },
    { href: '/questionarios', label: 'Questionários', icon: <ClipboardList className="w-4 h-4" /> },
    { href: '/transactions', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
    { href: '/whatsapp', label: 'WhatsApp', icon: <Smartphone className="w-4 h-4" /> },
    { href: '/crm', label: 'CRM', icon: <Target className="w-4 h-4" /> },
    { href: '/atendimento', label: 'Atendimento IA', icon: <Bot className="w-4 h-4 text-purple-500" /> },
    { href: '/estoque', label: 'Estoque', icon: <Package className="w-4 h-4" /> },
    { href: '/faturamento', label: 'Faturamento', icon: <Receipt className="w-4 h-4" /> },
    { href: '/configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  if (user) {
    navItems.push({ href: '/users', label: 'Equipe', icon: <Users className="w-4 h-4" /> });
    navItems.push({ href: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> });
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            CALYX
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {user && (
              <div className="flex items-center gap-2 pl-4 border-l">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

