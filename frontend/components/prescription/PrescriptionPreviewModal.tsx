'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Printer, Send, MessageSquare, ShieldCheck, Download, Mail } from 'lucide-react';
import { PrintParameters } from './PrintParametersModal';
import { useRef } from 'react';

interface PrescriptionPreviewModalProps {
    open: boolean;
    onClose: () => void;
    content: string; // HTML content from editor
    params: PrintParameters | null;
    patient?: any;
}

export function PrescriptionPreviewModal({ open, onClose, content, params, patient }: PrescriptionPreviewModalProps) {
    if (!params) return null;

    // TODO: In a real implementation, we would pass these refs to a printing service or use @react-pdf/renderer
    // For now, we simulate the preview visually.

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 overflow-hidden bg-gray-100 flex flex-col sm:flex-row">
                {/* Header for Mobile only (hidden on large screens usually handled by close button, but let's keep it clean) */}
                <div className="absolute right-4 top-4 z-50 sm:hidden">
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-6 h-6" /></Button>
                </div>

                {/* Left Column: Preview (Dark Background like generic PDF viewers) */}
                <div className="flex-1 bg-slate-800 p-8 overflow-y-auto flex justify-center relative">
                    {/* Toolbar Overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full flex gap-4 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-sm">1 / 1</span>
                        <div className="w-px bg-white/20"></div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white"><Printer className="w-4 h-4" /></Button>
                    </div>

                    {/* Paper Mockup */}
                    <div
                        className="bg-white shadow-2xl min-h-[297mm] w-[210mm] relative flex flex-col"
                        style={{
                            paddingTop: `${params.marginTop}cm`,
                            paddingBottom: `${params.marginBottom}cm`,
                            paddingLeft: `${params.marginLeft}cm`,
                            paddingRight: `${params.marginRight}cm`,
                        }}
                    >
                        {/* Header */}
                        {params.showHeaderFooter && (
                            <div className="mb-8 flex gap-4 items-center border-b pb-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">Logo</div>
                                <div>
                                    <h1 className="font-bold text-lg text-gray-800">{params.prescriber}</h1>
                                    <p className="text-xs text-gray-500">CRM-SC 12345 | RQE 1234</p>
                                    <p className="text-xs text-gray-500">Clínica Médica Especializada</p>
                                </div>
                            </div>
                        )}

                        {/* Patient Info Header */}
                        <div className="mb-8">
                            <p className="font-semibold text-gray-900">
                                Para: <span className="font-normal">{patient?.name || 'Nome do Paciente'}</span>
                            </p>
                            {params.showCPF && <p className="text-sm text-gray-600">CPF: {patient?.cpf || '000.000.000-00'}</p>}
                            {params.showAddress && <p className="text-sm text-gray-600">Endereço: {patient?.address || 'Rua Exemplo, 123'}</p>}
                        </div>

                        {/* Content */}
                        <div
                            className="flex-1 prose max-w-none text-gray-900 text-sm"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />

                        {/* Signature / Footer Area */}
                        <div className="mt-auto pt-8">
                            <div className="flex justify-between items-end">
                                {/* QRCode Section */}
                                {params.qrCode && (
                                    <div className="flex gap-2 items-center">
                                        <div className="w-24 h-24 bg-gray-900 p-1">
                                            {/* Mock QR */}
                                            <div className="w-full h-full bg-white flex items-center justify-center text-[10px] text-center p-1 font-mono break-all leading-none">
                                                QR CODE DE VALIDAÇÃO
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 max-w-[200px]">
                                            <p className="font-bold">Este documento foi assinado eletronicamente.</p>
                                            <p>Para verificar a autenticidade acesse:</p>
                                            <p className="text-blue-600 underline">https://validador.iti.br</p>
                                            <p className="mt-1">Assinado por: {params.prescriber}</p>
                                            <p>Data: {formatDate(params.date)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Doctor Stamp */}
                                {params.showStamp && (
                                    <div className="flex flex-col items-center">
                                        <div className="mb-4">
                                            {/* Simulated Signature */}
                                            <div className="font-cursive text-2xl text-blue-900 italic opacity-80">
                                                Paulo Guimarães Jr.
                                            </div>
                                        </div>
                                        <div className="border-t border-black pt-1 text-center w-48">
                                            <p className="font-bold text-sm uppercase">{params.prescriber}</p>
                                            <p className="text-xs">Médico - CRM/SC 33.498</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Line */}
                            {params.showHeaderFooter && (
                                <div className="mt-8 pt-2 border-t text-[10px] text-center text-gray-400 flex justify-between">
                                    <span>{params.prescriber} - Contato: (47) 99999-9999</span>
                                    {params.showPageNumber && <span>Pág 1/1</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="w-[400px] bg-white border-l flex flex-col shadow-xl z-10">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Envio por email
                        </h3>
                        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                    </div>

                    <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Nome do Remetente</Label>
                                <Input defaultValue={params.prescriber} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Email do Remetente</Label>
                                <Input defaultValue="drpauloguimaraesjr@gmail.com" className="h-8 text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Nome Destinatário</Label>
                                <Input defaultValue={patient?.name} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Email Destinatário</Label>
                                <Input defaultValue={patient?.email} className="h-8 text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Cco</Label>
                            <Input placeholder="Cco" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Assunto</Label>
                            <Input defaultValue="Segue em anexo documentos da sua consulta." className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Mensagem</Label>
                            <Textarea defaultValue="Segue em anexo documentos da sua consulta." className="min-h-[80px] text-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button className="bg-purple-600 hover:bg-purple-700 w-full text-xs">
                                <Mail className="w-3 h-3 mr-2" /> Enviar por email
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 w-full text-xs">
                                <MessageSquare className="w-3 h-3 mr-2" /> Enviar whatsapp
                            </Button>
                        </div>

                        <div className="mt-6 border rounded-lg p-3 bg-green-50 border-green-200">
                            <div className="flex gap-3">
                                <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                                <p className="text-xs text-green-800">
                                    <span className="font-bold">Não imprima.</span> Utilize seu certificado digital A3 ICP Brasil e assine digitalmente suas receitas, atestados e documentos. A natureza agradece.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50 space-y-3">
                        <div className="flex gap-2">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" variant="default">
                                Assinar Certificado Token
                            </Button>
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" variant="default">
                                Assinar Certificado Nuvem
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2 justify-center">
                            <Checkbox id="birdid" />
                            <label
                                htmlFor="birdid"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                            >
                                Certificado em Nuvem: BirdID - Clique aqui
                            </label>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
