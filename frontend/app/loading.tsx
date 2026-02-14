export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border border-border border-t-primary animate-spin mx-auto"></div>
        <p className="mono-label text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
