import React from 'react';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ConstructionPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="bg-muted p-6 rounded-full mb-6 animate-pulse">
                <Construction className="w-16 h-16 text-muted-foreground/70" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                Este módulo está sendo implementado com a precisão clínica que você merece.
                Em breve estará disponível.
            </p>
            <Link href="/configuracoes">
                <Button variant="outline">Voltar para Configurações</Button>
            </Link>
        </div>
    );
}
