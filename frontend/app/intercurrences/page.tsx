'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Search, Activity, MessageSquare, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { fetchIntercurrences, updateIntercurrenceStatus } from '@/lib/api';
import { Intercurrence } from '@/shared/types';

export default function IntercurrencesPage() {
    const [items, setItems] = useState<Intercurrence[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Intercurrence | null>(null);
    const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

    useEffect(() => {
        loadData();
        // Poll every 30 seconds for new alerts (Sentinel effect)
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchIntercurrences();
            // Sort by severity (critical first) then date
            const sorted = data.sort((a: Intercurrence, b: Intercurrence) => {
                const severityScores = { critical: 4, high: 3, medium: 2, low: 1 };
                const scoreA = severityScores[a.severity] || 0;
                const scoreB = severityScores[b.severity] || 0;
                if (scoreA !== scoreB) return scoreB - scoreA;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setItems(sorted);
        } catch (error) {
            console.error('Failed to load intercurrences', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateIntercurrenceStatus(id, newStatus);
            setSelectedItem(null);
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredItems = items.filter(i => {
        if (filter === 'all') return true;
        if (filter === 'open') return i.status !== 'resolved';
        return i.status === 'resolved';
    });

    const getSeverityColor = (s: string) => {
        switch (s) {
            case 'critical': return 'bg-destructive/15 text-red-700 border-destructive/30 animate-pulse';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-primary/15 text-primary border-primary/30';
        }
    };

    const getSeverityIcon = (s: string) => {
        switch (s) {
            case 'critical': return <AlertOctagon className="w-5 h-5 text-destructive" />;
            case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            case 'medium': return <Activity className="w-5 h-5 text-yellow-600" />;
            default: return <MessageSquare className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                        <Activity className="w-8 h-8 text-destructive" />
                        Central Sentinel
                    </h1>
                    <p className="text-muted-foreground">Monitoramento de riscos e efeitos colaterais em tempo real.</p>
                </div>

                <div className="flex bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('open')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'open' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground/80'}`}
                    >
                        Em Aberto
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'resolved' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground/80'}`}
                    >
                        Resolvidos
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                        >
                            <Card
                                className={`border-l-4 cursor-pointer hover: transition-all ${item.severity === 'critical' ? 'border-l-red-500' :
                                    item.severity === 'high' ? 'border-l-orange-500' :
                                        item.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                                    }`}
                                onClick={() => setSelectedItem(item)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${getSeverityColor(item.severity)}`}>
                                            {getSeverityIcon(item.severity)}
                                            {item.severity === 'critical' ? 'Crítico' : item.severity}
                                        </div>
                                        <span className="text-xs text-muted-foreground/70">
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg mt-2">{item.patientName}</CardTitle>
                                    <CardDescription>Paciente ID: {item.patientId}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/80 font-medium mb-2">
                                        &quot;{item.description}&quot;
                                    </p>
                                    {item.aiAnalysis && (
                                        <div className="bg-muted/50 p-3 rounded-md text-sm italic border border-slate-100">
                                            🤖 AI: {item.aiAnalysis.summary}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-end gap-2 text-xs text-muted-foreground">
                                    {item.status === 'open' && <span className="flex items-center text-orange-500"><Clock className="w-3 h-3 mr-1" /> Pendente</span>}
                                    {item.status === 'investigating' && <span className="flex items-center text-primary"><Search className="w-3 h-3 mr-1" /> Em Análise</span>}
                                    {item.status === 'resolved' && <span className="flex items-center text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolvido</span>}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredItems.length === 0 && !isLoading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground/70 opacity-50">
                        <CheckCircle2 className="w-16 h-16 mb-4" />
                        <p className="text-lg">Tudo tranquilo por aqui, Doutor.</p>
                        <p className="text-sm">Nenhum alerta do Sentinel no momento.</p>
                    </div>
                )}
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedItem && getSeverityIcon(selectedItem.severity)}
                            Detalhes da Intercorrência
                        </DialogTitle>
                        <DialogDescription>
                            Gerado automaticamente pelo Sentinel AI.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-muted/50 rounded-lg border">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Relato do Paciente</h4>
                                <p className="text-lg text-foreground">&quot;{selectedItem.description}&quot;</p>
                            </div>

                            {selectedItem.aiAnalysis && (
                                <div className="p-4 bg-primary/10 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2 text-primary">
                                        <Activity className="w-4 h-4" />
                                        <h4 className="text-sm font-bold uppercase">Análise da Sophia (IA)</h4>
                                    </div>
                                    <p className="text-sm text-foreground/80 mb-2">{selectedItem.aiAnalysis.summary}</p>
                                    <div className="bg-white p-2 rounded text-sm font-medium border-l-4 border-primary">
                                        💡 Sugestão: {selectedItem.aiAnalysis.suggestion}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground/70 mt-4">
                                Alerta ID: {selectedItem.id} • Criado em {new Date(selectedItem.createdAt).toLocaleString()}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2 sm:justify-between">
                        {selectedItem?.status !== 'resolved' ? (
                            <>
                                <Button variant="outline" onClick={() => handleStatusUpdate(selectedItem!.id, 'investigating')}>
                                    <Search className="w-4 h-4 mr-2" />
                                    Investigar
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(selectedItem!.id, 'resolved')}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Marcar Resolvido
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" className="w-full" onClick={() => handleStatusUpdate(selectedItem!.id, 'open')}>
                                Reabrir Caso
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
