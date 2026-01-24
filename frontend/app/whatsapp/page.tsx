'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, Smartphone, AlertTriangle, BookOpen, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock Component: Playbook Sidebar (To be unified with real data later)
function PlaybookSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    const steps = [
        { id: 1, title: 'Saudação', type: 'script', content: 'Olá! Sou a assistente virtual da Clínica. Como posso ajudar?' },
        { id: 2, title: 'Qualificação', type: 'input', label: 'Motivo do Contato', placeholder: 'Ex: Agendar Consulta' },
        { id: 3, title: 'Convênio', type: 'input', label: 'Possui Convênio?', placeholder: 'Ex: Unimed' },
        { id: 4, title: 'Oferta', type: 'script', content: 'Temos agenda disponível para Terça-feira às 14h. Pode ser?' },
    ];

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-teal-50">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-700" />
                    <h3 className="font-bold text-teal-800">Roteiro de Atendimento</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4 text-teal-700" />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div key={step.id} className="relative pl-4 border-l-2 border-slate-200 hover:border-teal-400 transition-colors group">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-300 group-hover:border-teal-500 group-hover:bg-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {index + 1}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-2">{step.title}</h4>

                            {step.type === 'script' ? (
                                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-sm text-slate-600 cursor-pointer hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-all"
                                    onClick={() => navigator.clipboard.writeText(step.content)}
                                    title="Clique para copiar">
                                    "{step.content}"
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">{step.label}</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-500 outline-none"
                                        placeholder={step.placeholder}
                                    />
                                    <Button size="sm" variant="outline" className="w-full text-xs h-7 mt-1">Salvar Dado</Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-100 bg-slate-50">
                <div className="text-xs text-center text-slate-400">
                    Playbook: <strong>Triagem Padrão</strong>
                </div>
            </div>
        </div>
    );
}

export default function WhatsAppPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'disconnected' | 'connected' | 'connecting'>('disconnected');
    const [loading, setLoading] = useState(true);
    const [backendUrl, setBackendUrl] = useState('');
    const [showPlaybook, setShowPlaybook] = useState(false); // State for Sidebar

    useEffect(() => {
        // Determina URL do backend baseada no ambiente
        // NEXT_PUBLIC_BACKEND_URL deve estar configurada no .env.local
        const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        setBackendUrl(url);
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const fetchStatus = async () => {
        if (!backendUrl) return;
        try {
            setLoading(true);
            const res = await fetch(`${backendUrl}/api/whatsapp/status`);
            const data = await res.json();

            if (data.success) {
                if (data.connected) {
                    setStatus('connected');
                    setQrCode(null);
                } else if (data.qrCode) {
                    setStatus('disconnected');
                    setQrCode(data.qrCode);
                } else {
                    setStatus('connecting');
                    setQrCode(null);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (backendUrl) {
            fetchStatus();
            // Polling para atualizar QR Code/Status
            const interval = setInterval(fetchStatus, 3000); // 3 segundos
            return () => clearInterval(interval);
        }
    }, [backendUrl]);

    if (authLoading || !user) return null;

    return (
        <div className="flex h-screen overflow-hidden">
            <main className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto relative">

                {/* Floating Button for Playbook */}
                <button
                    onClick={() => setShowPlaybook(!showPlaybook)}
                    className="fixed right-6 top-24 z-40 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-all hover:scale-105"
                    title="Abrir Roteiro de Atendimento"
                >
                    <BookOpen className="w-6 h-6" />
                </button>

                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conexão WhatsApp</h1>
                            <p className="text-slate-500 dark:text-slate-400">Gerencie a conexão do bot para envio de mensagens e leitura de comprovantes.</p>
                        </div>
                        <Button onClick={fetchStatus} variant="outline" disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status da Conexão</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                                {status === 'connected' ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-600">Conectado!</h3>
                                        <p className="text-center text-gray-500">O sistema está pronto para enviar e receber mensagens.</p>
                                    </>
                                ) : status === 'connecting' ? (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse">
                                            <Smartphone className="w-8 h-8 text-yellow-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-yellow-600">Conectando...</h3>
                                        <p className="text-center text-gray-500">Aguardando geração do QR Code ou reconexão...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertTriangle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-red-600">Desconectado</h3>
                                        <p className="text-center text-gray-500">Escaneie o QR Code ao lado para conectar.</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* QR Code Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>QR Code</CardTitle>
                                <CardDescription>Abra o WhatsApp no seu celular {'>'} Menu {'>'} Aparelhos Conectados {'>'} Conectar Aparelho</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-4 min-h-[300px]">
                                {qrCode ? (
                                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                                            alt="WhatsApp QR Code"
                                            className="w-64 h-64 object-contain"
                                        />
                                    </div>
                                ) : status === 'connected' ? (
                                    <div className="text-center text-gray-400">
                                        <p>Conexão ativa</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                                        <p>Aguardando QR Code...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Playbook Sidebar Integration */}
            <PlaybookSidebar isOpen={showPlaybook} onClose={() => setShowPlaybook(false)} />
        </div>
    );
}
