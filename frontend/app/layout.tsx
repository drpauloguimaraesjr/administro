import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { AuthProvider } from '@/components/auth/auth-provider';
import Providers from '@/components/providers';

const font = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CALYX - Sistema Médico',
  description: 'Prontuário Eletrônico e Gestão Médica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={font.className}>
        <Providers>
          <AuthProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
