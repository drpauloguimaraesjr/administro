'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Wand2, Save, X, Plus, FileText, Trash2, Clock, History, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateKnowledge, saveKnowledge, saveKnowledgeDraft, fetchKnowledgeDrafts, deleteKnowledgeDraft } from '@/lib/api';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';

export default function KnowledgePage() {
    const [rawText, setRawText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedItems, setGeneratedItems] = useState<any[]>([]);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<{
        isLarge: boolean;
        totalChunks: number;
        currentChunk: number;
        status: 'idle' | 'saving' | 'processing' | 'done' | 'error';
        message: string;
    }>({ isLarge: false, totalChunks: 0, currentChunk: 0, status: 'idle', message: '' });

    // Fetch drafts on load
    useEffect(() => {
        loadDrafts();
    }, []);

    const loadDrafts = async () => {
        setIsLoadingDrafts(true);
        try {
            const data = await fetchKnowledgeDrafts();
            setDrafts(data);
        } catch (error) {
            console.error('Error fetching drafts:', error);
            // toast.error('Erro ao carregar rascunhos.'); // Silent fail is better here to not annoy user
        } finally {
            setIsLoadingDrafts(false);
        }
    };

    // Constants for chunking detection (must match backend)
    const MAX_CHUNK_SIZE = 25000;

    const getChunkInfo = (text: string) => {
        if (text.length <= MAX_CHUNK_SIZE) {
            return { chunks: 1, isLarge: false };
        }
        const chunks = Math.ceil(text.length / (MAX_CHUNK_SIZE - 500)); // Account for overlap
        return { chunks, isLarge: true };
    };

    const handleGenerate = async () => {
        if (!rawText.trim()) {
            toast.error('Por favor, insira um texto para processar.');
            return;
        }

        const { chunks, isLarge } = getChunkInfo(rawText);

        // Reset and set initial status
        setProcessingStatus({
            isLarge,
            totalChunks: chunks,
            currentChunk: 0,
            status: 'saving',
            message: 'Salvando rascunho...'
        });

        setIsGenerating(true);
        setGeneratedItems([]); // Clear previous results

        try {
            // 1. Save Draft First (Auto-save)
            try {
                const title = rawText.substring(0, 30) + '...';
                await saveKnowledgeDraft(rawText, title);
                toast.success('✅ Rascunho salvo!');
                loadDrafts();
            } catch (draftError) {
                console.error("Failed to save draft:", draftError);
            }

            // Update status to processing
            setProcessingStatus(prev => ({
                ...prev,
                status: 'processing',
                message: isLarge
                    ? `Processando ${chunks} partes... Isso pode levar alguns minutos.`
                    : 'Processando texto com IA...'
            }));

            // 2. Generate Knowledge
            const data = await generateKnowledge(rawText);

            // The backend returns { results: [...] } or { topic: ... }
            let items = [];
            if (data.results && Array.isArray(data.results)) {
                items = data.results;
            } else if (data.topic) {
                items = [data];
            }

            setGeneratedItems(items);

            // Update to done status
            setProcessingStatus(prev => ({
                ...prev,
                status: 'done',
                message: items.length > 0
                    ? `✅ ${items.length} itens gerados com sucesso!`
                    : 'Nenhum conhecimento médico relevante encontrado.'
            }));

            if (items.length > 0) {
                toast.success(`🎉 ${items.length} itens de conhecimento gerados!`, { duration: 5000 });
            }
        } catch (error) {
            console.error(error);
            setProcessingStatus(prev => ({
                ...prev,
                status: 'error',
                message: '❌ Erro ao processar. Tente novamente.'
            }));
            toast.error('Erro ao gerar conhecimento.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLoadDraft = (draft: any) => {
        setRawText(draft.content);
        toast.info('Rascunho carregado!');
    };

    const handleDeleteDraft = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent loading draft when clicking delete
        if (!confirm('Tem certeza que deseja excluir este rascunho?')) return;

        try {
            await deleteKnowledgeDraft(id);
            setDrafts(prev => prev.filter(d => d.id !== id));
            toast.success('Rascunho excluído.');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir rascunho.');
        }
    };

    const handleSaveItem = async (index: number) => {
        const itemToSave = generatedItems[index];
        try {
            await saveKnowledge(itemToSave);
            toast.success(`'${itemToSave.topic}' salvo no Cérebro!`);

            // Remove from list
            setGeneratedItems(prev => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar item.');
        }
    };

    const handleDeleteItem = (index: number) => {
        setGeneratedItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleClear = () => {
        setRawText('');
        setGeneratedItems([]);
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-[1600px]">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                        <Brain className="h-8 w-8 text-purple-600" />
                        Cérebro Calyx
                    </h1>
                    <p className="text-slate-500">
                        Transforme transcrições brutas em inteligência estruturada.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Future actions */}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Left Sidebar - Drafts History */}
                <div className="col-span-12 lg:col-span-3 xl:col-span-2 hidden lg:flex flex-col gap-4">
                    <Card className="h-full flex flex-col border-slate-200 shadow-sm bg-slate-50/50">
                        <CardHeader className="pb-3 px-4 pt-4">
                            <CardTitle className="text-sm font-semibold text-slate-500 uppercase flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Histórico de Uploads
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            <ScrollArea className="h-full px-2">
                                <div className="space-y-2 p-2">
                                    {isLoadingDrafts && (
                                        <p className="text-xs text-center text-slate-400 py-4">Carregando...</p>
                                    )}
                                    {!isLoadingDrafts && drafts.length === 0 && (
                                        <p className="text-xs text-center text-slate-400 py-4">Nenhum rascunho salvo.</p>
                                    )}
                                    {drafts.map((draft) => (
                                        <div
                                            key={draft.id}
                                            onClick={() => handleLoadDraft(draft)}
                                            className="group flex flex-col gap-1 p-3 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 cursor-pointer transition-all bg-white/50"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-xs font-medium text-slate-700 line-clamp-2 leading-tight">
                                                    {draft.title || 'Sem título'}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteDraft(e, draft.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {draft.createdAt && (() => {
                                                    try {
                                                        // Handle Firestore Timestamp or ISO string
                                                        const date = typeof draft.createdAt === 'string'
                                                            ? new Date(draft.createdAt)
                                                            : new Date(draft.createdAt._seconds * 1000);

                                                        return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
                                                    } catch (e) {
                                                        return 'data inválida';
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="col-span-12 lg:col-span-9 xl:col-span-10 flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                    {/* Input Area */}
                    <div className="flex-1 flex flex-col min-h-[500px] h-full">
                        <Card className="h-full flex flex-col shadow-md border-slate-200">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Entrada de Conhecimento</CardTitle>
                                        <CardDescription>
                                            Cole aqui o texto para processar.
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-slate-400 hover:text-red-500">
                                        Limpar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 relative group">
                                <Textarea
                                    placeholder="Cole a transcrição aqui..."
                                    className="h-full resize-none border-0 focus-visible:ring-0 rounded-none p-6 text-lg leading-relaxed font-normal bg-slate-50/30"
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    disabled={isGenerating}
                                />
                            </CardContent>

                            {/* Processing Status Panel */}
                            <AnimatePresence>
                                {processingStatus.status !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50"
                                    >
                                        <div className="p-4 space-y-3">
                                            {/* Status Header */}
                                            <div className="flex items-center gap-3">
                                                {processingStatus.status === 'saving' && (
                                                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                                                )}
                                                {processingStatus.status === 'processing' && (
                                                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                                                )}
                                                {processingStatus.status === 'done' && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                )}
                                                {processingStatus.status === 'error' && (
                                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                <span className={`font-medium ${processingStatus.status === 'done' ? 'text-green-700' :
                                                    processingStatus.status === 'error' ? 'text-red-700' :
                                                        'text-purple-700'
                                                    }`}>
                                                    {processingStatus.message}
                                                </span>
                                            </div>

                                            {/* Chunk Info for Large Texts */}
                                            {processingStatus.isLarge && processingStatus.status === 'processing' && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>📦 Texto dividido em {processingStatus.totalChunks} partes</span>
                                                        <span>⏱️ ~{processingStatus.totalChunks * 30}s estimado</span>
                                                    </div>
                                                    <Progress value={undefined} className="h-2 animate-pulse" />
                                                </div>
                                            )}

                                            {/* Done with count */}
                                            {processingStatus.status === 'done' && generatedItems.length > 0 && (
                                                <p className="text-sm text-slate-600">
                                                    Revise os itens gerados à direita e clique em <strong>&quot;Aprovar &amp; Salvar&quot;</strong> para adicionar ao Cérebro.
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <CardFooter className="p-4 bg-slate-50 border-t items-center justify-between">
                                <div className="hidden sm:flex items-center gap-4">
                                    <p className="text-xs text-slate-400">
                                        {rawText.length.toLocaleString()} caracteres
                                    </p>
                                    {rawText.length > MAX_CHUNK_SIZE && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                            📦 {getChunkInfo(rawText).chunks} partes
                                        </span>
                                    )}
                                </div>
                                <Button
                                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all font-semibold"
                                    size="lg"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !rawText.trim()}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="mr-2 h-4 w-4" />
                                            Processar com IA
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Results Area - Scrollable */}
                    {(generatedItems.length > 0) && (
                        <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-purple-600" />
                                    Insights Gerados ({generatedItems.length})
                                </h3>
                            </div>

                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4 pb-8">
                                    {generatedItems.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow group">
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <CardTitle className="text-base font-bold text-slate-800 leading-tight">
                                                            {item.topic}
                                                        </CardTitle>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-slate-300 hover:text-red-500 -mt-1 -mr-2"
                                                            onClick={() => handleDeleteItem(index)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <CardDescription className="text-xs font-medium text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded-full mt-1">
                                                        {item.category}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-4 space-y-3">
                                                    <div>
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Princípio (Why)</Label>
                                                        <p className="text-sm italic text-slate-600 mt-1 pl-2 border-l-2 border-slate-200">
                                                            &quot;{item.principle}&quot;
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sophia Responde</Label>
                                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                                            {item.sophiaResponse}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                        size="sm"
                                                        onClick={() => handleSaveItem(index)}
                                                    >
                                                        Aprovar & Salvar
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
