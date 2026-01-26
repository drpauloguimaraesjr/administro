'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Wand2, Save, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateKnowledge, saveKnowledge } from '@/lib/api';
import { toast } from 'sonner';

export default function KnowledgePage() {
    const [rawText, setRawText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedItems, setGeneratedItems] = useState<any[]>([]);

    const handleGenerate = async () => {
        if (!rawText.trim()) {
            toast.error('Por favor, insira um texto para processar.');
            return;
        }

        setIsGenerating(true);
        try {
            const data = await generateKnowledge(rawText);

            // The backend returns { results: [...] } or { topic: ... }
            let items = [];
            if (data.results && Array.isArray(data.results)) {
                items = data.results;
            } else if (data.topic) {
                items = [data]; // Fallback for single item
            }

            setGeneratedItems(items);
            toast.success(`${items.length} itens de conhecimento gerados!`);
            setRawText(''); // Clear input on success
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar conhecimento. Tente novamente.');
        } finally {
            setIsGenerating(false);
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

    return (
        <div className="container mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <Brain className="h-8 w-8 text-purple-600" />
                    Cérebro Calyx
                </h1>
                <p className="text-slate-500">
                    Transforme transcrições brutas em inteligência estruturada para a Sophia.
                </p>
            </header>

            <Tabs defaultValue="generator" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
                    <TabsTrigger value="generator">Gerador de IA</TabsTrigger>
                    <TabsTrigger value="library">Biblioteca (Em breve)</TabsTrigger>
                </TabsList>

                <TabsContent value="generator">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Input Area */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Entrada de Conhecimento</CardTitle>
                                    <CardDescription>
                                        Cole aqui a transcrição de áudio, anotações de consulta ou pensamentos soltos.
                                        A IA vai ler, entender e separar por tópicos.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Cole o texto aqui (pode ser longo)..."
                                        className="min-h-[400px] text-lg p-4 font-normal"
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                    />
                                    <Button
                                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                                        size="lg"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processando Inteligência...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Gerar Conhecimento Estruturado
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Results Area */}
                        <div className="space-y-6">
                            {generatedItems.length > 0 && (
                                <h3 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                                    <Save className="h-5 w-5" />
                                    Itens para Revisão ({generatedItems.length})
                                </h3>
                            )}

                            {generatedItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative"
                                >
                                    <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-start">
                                                <span>{item.topic}</span>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteItem(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardTitle>
                                            <CardDescription>Categoria: {item.category}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label className="text-xs font-bold text-slate-400 uppercase">Princípio (Why)</Label>
                                                <p className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-sm italic border-l-2 border-slate-300">
                                                    "{item.principle}"
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-bold text-slate-400 uppercase">Ação (What)</Label>
                                                <p className="text-sm">{item.action}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-bold text-slate-400 uppercase">Resposta Sophia</Label>
                                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                                    {item.sophiaResponse}
                                                </p>
                                            </div>
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleSaveItem(index)}
                                            >
                                                Aprovar e Salvar
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}

                            {generatedItems.length === 0 && !isGenerating && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-xl p-12 bg-slate-50/50">
                                    <Brain className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Os itens processados aparecerão aqui.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="library">
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                        <p>A biblioteca de conhecimento será implementada em breve.</p>
                        <p className="text-sm">Todo item salvo vai para o banco de dados e poderá ser consultado aqui.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
