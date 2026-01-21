'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

export default function WhatsAppPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'disconnected' | 'connected' | 'connecting'>('disconnected');
    const [loading, setLoading] = useState(true);
    const [backendUrl, setBackendUrl] = useState('');

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
        <main className="min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
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
                                // Exibe imagem do QR Code. O backend retorna a string do QR Code (não base64 image diretamente geralmente no Baileys, é string de conexão)
                                // Se for a string raw do baileys, precisamos usar uma lib de QR CODE no frontend.
                                // Mas o backend pode retornar imagem se quisermos.
                                // Vamos assumir que vamos usar 'qrcode.react' no frontend ou exibir um placeholder se nao tiver a lib.
                                // Vou verificar package.json se tem qrcode.react. Se nao tiver, vou usar uma API externa de QR Code para facilitar ou pedir para instalar.
                                // Para garantir: vou usar uma API pública de renderização de QR code simples: https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=...
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
    );
}
