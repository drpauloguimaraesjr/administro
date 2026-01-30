'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Printer, Send, MessageSquare, ShieldCheck, Download, Mail } from 'lucide-react';
import { PrintParameters } from './PrintParametersModal';
import { DOCTOR_CONFIG, formatCRM, formatDate, formatDateTime } from '@/lib/doctor-config';
import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface PatientData {
    name: string;
    cpf?: string;
    rg?: string;
    gender?: string;
    phone?: string;
    birthDate?: string;
    age?: number;
    address?: string;
    email?: string;
}

interface PrescriptionPreviewModalProps {
    open: boolean;
    onClose: () => void;
    content: string;
    params: PrintParameters | null;
    patient?: PatientData;
    type?: 'simples' | 'controlada';
}

export function PrescriptionPreviewModal({
    open,
    onClose,
    content,
    params,
    patient: patientProp,
    type = 'simples'
}: PrescriptionPreviewModalProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    if (!params) return null;

    const documentId = `${Date.now().toString(36).toUpperCase()}`;
    const validationUrl = `${DOCTOR_CONFIG.validationUrl}?i=${documentId}`;
    const currentDate = new Date();

    // Generate QR Code
    useEffect(() => {
        if (params.qrCode) {
            QRCode.toDataURL(validationUrl, {
                width: 100,
                margin: 1,
                color: { dark: '#000000', light: '#ffffff' }
            }).then(setQrCodeUrl).catch(console.error);
        }
    }, [params.qrCode, validationUrl]);

    const formatDateBR = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age} anos`;
    };

    // Use patient from props or defaults
    const patient: PatientData = patientProp || {
        name: 'Nome do Paciente',
        cpf: '000.000.000-00',
        rg: '',
        gender: 'Masculino',
        phone: '(47) 9 0000-0000',
        birthDate: '1990-01-01',
        age: 35,
        address: 'Endereço do Paciente',
        email: 'paciente@email.com'
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 overflow-hidden bg-gray-100 flex flex-col sm:flex-row">
                <div className="absolute right-4 top-4 z-50 sm:hidden">
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-6 h-6" /></Button>
                </div>

                {/* Left Column: Preview */}
                <div className="flex-1 bg-slate-800 p-4 overflow-y-auto flex justify-center relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full flex gap-4 z-10">
                        <span className="text-sm">1 / 1</span>
                        <div className="w-px bg-white/20"></div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white" onClick={handlePrint}><Printer className="w-4 h-4" /></Button>
                    </div>

                    {/* Paper */}
                    <div ref={printRef} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] relative print:shadow-none">
                        {type === 'controlada' ? (
                            // ========== RECEITUÁRIO DE CONTROLE ESPECIAL ==========
                            <div className="p-6 text-[11px] leading-tight">
                                {/* Header */}
                                <div className="border-2 border-black">
                                    <div className="bg-black text-white text-center py-1 font-bold text-sm">
                                        Receituário de Controle Especial
                                    </div>

                                    <div className="flex">
                                        {/* Identificação do Emitente */}
                                        <div className="flex-1 p-2 border-r border-black">
                                            <div className="font-bold text-center border-b border-black pb-1 mb-2">
                                                Identificação do Emitente
                                            </div>
                                            <table className="w-full">
                                                <tbody>
                                                    <tr>
                                                        <td className="font-semibold w-24">Nome Completo:</td>
                                                        <td colSpan={3}>{DOCTOR_CONFIG.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">CRM:</td>
                                                        <td>{DOCTOR_CONFIG.crm}</td>
                                                        <td className="font-semibold w-10">UF:</td>
                                                        <td>{DOCTOR_CONFIG.uf}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">Endereço:</td>
                                                        <td colSpan={3}>{DOCTOR_CONFIG.fullAddress}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="font-semibold">Telefone:</td>
                                                        <td>{DOCTOR_CONFIG.phone}</td>
                                                        <td className="font-semibold">CPF:</td>
                                                        <td>{DOCTOR_CONFIG.cpf}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Via Farmácia / Via Paciente */}
                                        <div className="w-32 flex flex-col justify-center items-center p-2">
                                            <div className="font-bold text-right">1ª VIA FARMÁCIA</div>
                                            <div className="font-bold text-right">2ª VIA PACIENTE</div>
                                        </div>
                                    </div>

                                    {/* Identificação do Paciente */}
                                    <div className="border-t-2 border-black">
                                        <div className="font-bold text-center border-b border-black py-1">
                                            Identificação do Paciente
                                        </div>
                                        <div className="p-2">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                <div><span className="font-semibold">Paciente:</span> {patient.name}</div>
                                                <div></div>
                                                <div><span className="font-semibold">CPF:</span> {patient.cpf}</div>
                                                <div><span className="font-semibold">RG:</span> {patient.rg || ''}</div>
                                                <div><span className="font-semibold">Sexo:</span> {patient.gender}</div>
                                                <div><span className="font-semibold">Telefone:</span> {patient.phone}</div>
                                                <div><span className="font-semibold">Nascimento:</span> {patient.birthDate ? formatDateBR(patient.birthDate) : ''}</div>
                                                <div><span className="font-semibold">Idade:</span> {patient.birthDate ? calculateAge(patient.birthDate) : ''}</div>
                                                <div className="col-span-2"><span className="font-semibold">Endereço:</span> {patient.address}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Prescrição */}
                                <div className="mt-4">
                                    <div className="text-center font-bold text-base border-b-2 border-black pb-1 mb-4">
                                        PRESCRIÇÃO
                                    </div>

                                    {/* Content Area */}
                                    <div
                                        className="min-h-[350px] prose max-w-none text-sm"
                                        style={{
                                            paddingLeft: `${params.marginLeft}cm`,
                                            paddingRight: `${params.marginRight}cm`,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />

                                    {/* Assinatura */}
                                    <div className="text-center mt-8 pt-4">
                                        <div className="text-sm text-gray-600 mb-2">
                                            {DOCTOR_CONFIG.email} {formatDateBR(params.date)}
                                        </div>
                                        <div className="font-bold">{DOCTOR_CONFIG.shortName}</div>
                                        <div className="text-sm">{formatCRM(DOCTOR_CONFIG.crm, DOCTOR_CONFIG.uf)}</div>
                                    </div>
                                </div>

                                {/* QR Code e Validação */}
                                {params.qrCode && (
                                    <div className="mt-8 flex items-start gap-4">
                                        {qrCodeUrl && (
                                            <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                                        )}
                                        <div className="text-[10px] text-gray-600">
                                            <p className="text-green-700">Este documento foi gerado assinado eletronicamente.</p>
                                            <p>Para verificar a autenticidade acesse:</p>
                                            <p className="text-blue-600">{validationUrl}</p>
                                            <p>Documento gerado em: {formatDateTime(currentDate)} Ip: 000.000.00.000</p>
                                        </div>
                                    </div>
                                )}

                                {/* Seção Farmácia */}
                                <div className="mt-6 border-2 border-black">
                                    <div className="flex">
                                        <div className="flex-1 border-r border-black p-3">
                                            <div className="font-bold text-center border-b border-black pb-1 mb-2">
                                                Identificação do Comprador
                                            </div>
                                            <div className="space-y-3">
                                                <div>Nome:</div>
                                                <div className="flex gap-8">
                                                    <span>Identidade:</span>
                                                    <span>Órgão Emissor:</span>
                                                </div>
                                                <div>Endereço:</div>
                                                <div>Telefone:</div>
                                            </div>
                                        </div>
                                        <div className="w-1/3 p-3">
                                            <div className="font-bold text-center border-b border-black pb-1 mb-2">
                                                Identificação do Fornecedor
                                            </div>
                                            <div className="h-20"></div>
                                            <div className="flex justify-between border-t border-black pt-2">
                                                <span>Assinatura do Farmacêutico</span>
                                                <span>Data</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // ========== RECEITUÁRIO SIMPLES ==========
                            <div
                                className="flex flex-col h-full"
                                style={{
                                    paddingTop: `${params.marginTop}cm`,
                                    paddingBottom: `${params.marginBottom}cm`,
                                    paddingLeft: `${params.marginLeft}cm`,
                                    paddingRight: `${params.marginRight}cm`,
                                }}
                            >
                                {/* Header */}
                                {params.showHeaderFooter && (
                                    <div className="mb-6 flex gap-4 items-center border-b pb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            PG
                                        </div>
                                        <div>
                                            <h1 className="font-bold text-lg text-gray-800">{DOCTOR_CONFIG.shortName}</h1>
                                            <p className="text-xs text-gray-500">{formatCRM(DOCTOR_CONFIG.crm, DOCTOR_CONFIG.uf)}</p>
                                            <p className="text-xs text-gray-500">{DOCTOR_CONFIG.fullAddress}</p>
                                            <p className="text-xs text-gray-500">{DOCTOR_CONFIG.phone} | {DOCTOR_CONFIG.email}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Patient Info */}
                                <div className="mb-6">
                                    <p className="font-semibold text-gray-900">
                                        Para: <span className="font-normal">{patient.name}</span>
                                    </p>
                                    {params.showCPF && <p className="text-sm text-gray-600">CPF: {patient.cpf}</p>}
                                    {params.showAddress && <p className="text-sm text-gray-600">Endereço: {patient.address}</p>}
                                    <p className="text-sm text-gray-600">Data: {formatDateBR(params.date)}</p>
                                </div>

                                {/* Content */}
                                <div
                                    className="flex-1 prose max-w-none text-gray-900 text-sm"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />

                                {/* Footer */}
                                <div className="mt-auto pt-8">
                                    <div className="flex justify-between items-end">
                                        {/* QRCode */}
                                        {params.qrCode && qrCodeUrl && (
                                            <div className="flex gap-2 items-center">
                                                <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                                                <div className="text-[10px] text-gray-500 max-w-[180px]">
                                                    <p className="font-bold text-green-700">Documento assinado eletronicamente.</p>
                                                    <p>Para verificar acesse:</p>
                                                    <p className="text-blue-600 underline break-all">{validationUrl}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Signature */}
                                        {params.showStamp && (
                                            <div className="flex flex-col items-center">
                                                <div className="font-cursive text-2xl text-blue-900 italic opacity-80 mb-2">
                                                    Paulo Guimarães Jr.
                                                </div>
                                                <div className="border-t border-black pt-1 text-center w-48">
                                                    <p className="font-bold text-sm uppercase">{DOCTOR_CONFIG.shortName}</p>
                                                    <p className="text-xs">{formatCRM(DOCTOR_CONFIG.crm, DOCTOR_CONFIG.uf)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Line */}
                                    {params.showHeaderFooter && (
                                        <div className="mt-6 pt-2 border-t text-[10px] text-center text-gray-400 flex justify-between">
                                            <span>{DOCTOR_CONFIG.phone} | {DOCTOR_CONFIG.email}</span>
                                            {params.showPageNumber && <span>Pág 1/1</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                                <Input defaultValue={DOCTOR_CONFIG.shortName} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Email do Remetente</Label>
                                <Input defaultValue={DOCTOR_CONFIG.email} className="h-8 text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Nome Destinatário</Label>
                                <Input defaultValue={patient.name} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Email Destinatário</Label>
                                <Input defaultValue={patient.email} className="h-8 text-sm" />
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
