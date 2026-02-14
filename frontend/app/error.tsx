'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-destructive">Erro ao carregar</h1>
        <p className="font-mono text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors duration-150"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
