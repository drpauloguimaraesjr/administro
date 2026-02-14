import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Mono } from 'next/font/google';
import './globals.css';
import { MainLayout } from '@/components/layout/main-layout';
import { AuthProvider } from '@/components/auth/auth-provider';
import Providers from '@/components/providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

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
      <body className={`${playfair.variable} ${dmMono.variable} font-mono`}>
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
