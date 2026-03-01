import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PortalAuthProvider } from '@/components/portal/portal-auth-provider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Portal do Paciente - CALYX',
    description: 'Acesse suas receitas, aplicações e documentos médicos',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.variable} font-sans min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}>
            <PortalAuthProvider>
                {children}
            </PortalAuthProvider>
        </div>
    );
}
