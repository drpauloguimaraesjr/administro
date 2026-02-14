'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm"
      >
        {/* Brand Mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-[#7c9a72] flex items-center justify-center text-white font-mono text-sm font-medium tracking-wider mb-4">
            CX
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            CALYX
          </h1>
          <p className="mono-label text-muted-foreground mt-2">
            Sistema Médico
          </p>
        </div>

        {/* Login Card */}
        <div className="border border-border bg-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 border border-destructive/30 bg-destructive/5 text-destructive font-mono text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="mono-label text-muted-foreground mb-2 block">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-transparent border-border focus:border-foreground/50 font-mono text-sm h-10"
              />
            </div>

            <div>
              <label className="mono-label text-muted-foreground mb-2 block">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-transparent border-border focus:border-foreground/50 font-mono text-sm h-10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#7c9a72] hover:bg-[#6b8a62] text-white font-mono text-xs font-medium uppercase tracking-[0.15em] border-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 mono-label text-muted-foreground/60">
          Dr. Paulo Guimarães Jr.
        </p>
      </motion.div>
    </div>
  );
}
