'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, DollarSign, Smartphone, Calendar, Users, Shield, LogOut, Share2, ClipboardList, Target, Settings, Activity, Brain, Bot, Package, Receipt, HeartPulse } from 'lucide-react';
import { useAuth } from './auth/auth-provider';
import { Button } from './ui/button';
import { auth as firebaseAuth } from '@/lib/firebase/config';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isAlsoPatient, setIsAlsoPatient] = useState(false);

  // Verificar se o usuário logado também é paciente (tem patientId nos claims)
  useEffect(() => {
    async function checkPatientClaims() {
      if (user && firebaseAuth?.currentUser) {
        try {
          const tokenResult = await firebaseAuth.currentUser.getIdTokenResult();
          if (tokenResult.claims.patientId) {
            setIsAlsoPatient(true);
          }
        } catch {
          // Silently fail
        }
      }
    }
    checkPatientClaims();
  }, [user]);

  const navItems = [
    { href: '/knowledge', label: 'Cérebro', icon: <Brain className="w-4 h-4 text-purple-500" /> },
    { href: '/intercurrences', label: 'Alertas', icon: <Activity className="w-4 h-4 text-destructive" /> },
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
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
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
                {/* Toggle para Portal do Paciente — só para médicos que também são pacientes */}
                {isAlsoPatient && (
                  <Link
                    href="/portal"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-colors"
                    title="Acessar como Paciente"
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Meu Portal</span>
                  </Link>
                )}
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
