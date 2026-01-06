'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, DollarSign, BarChart3, TrendingUp, Shield, LogOut } from 'lucide-react';
import { useAuth } from './auth/auth-provider';
import { Button } from './ui/button';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: '/transactions', label: 'Transações', icon: <DollarSign className="w-4 h-4" /> },
    { href: '/reports', label: 'Relatórios', icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/investments', label: 'Investimentos', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  if (user) {
    navItems.push({ href: '/admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> });
  }

  return (
    <nav className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Administrador de Contas
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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

