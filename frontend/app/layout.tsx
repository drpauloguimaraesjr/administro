import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { AuthProvider } from '@/components/auth/auth-provider';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });
// ... (omitted)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
