import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowLeft, Printer, Copy, Plus, ArrowRightCircle, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import api from '@/lib/api';

import { PatientHeader } from '@/components/medical-record/patient-header';
import { RichEditor, RichEditorRef } from '@/components/medical-record/rich-editor';
import { PrintParameters, PrintParametersModal } from '@/components/prescription/PrintParametersModal';
import { PrescriptionPreviewModal } from '@/components/prescription/PrescriptionPreviewModal';
import { FormulasPanel } from '@/components/prescription/FormulasPanel';
import { PrescriptionFormula } from '@/types/prescription';
import { toast } from 'sonner';

export default function PrescriptionPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;
    const editorRef = useRef<RichEditorRef>(null);

    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [printParams, setPrintParams] = useState<PrintParameters | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [prescriptionType, setPrescriptionType] = useState<'simples' | 'controlada'>('simples');

    const { data: patient } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}`);
            return res.data;
        },
    });

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSelectFormula = (formula: PrescriptionFormula) => {
        if (editorRef.current) {
            // Extract usage route (simplified logic: take first part before comma or space)
            const via = formula.usage ? formula.usage.split(/[, ]/)[0] : '';

            const text = `
            <p><strong><span style="font-size: 14px">USO INJETÁVEL</span></strong></p>
            <p></p>
            <p><strong>${formula.name} ${formula.dosage || ''}</strong> - 1 amp ${via} a cada 30 dias.</p>
            <p></p>
            <p>${formula.description || ''}</p>
            <p></p>
            <p><strong>Posologia:</strong> ${formula.dosage || '-'}</p>
            <p><strong>Fornecedor:</strong> ${formula.supplier || '-'}</p>
            <p><strong>Uso:</strong> ${formula.usage || ''} ${formula.presentation || ''}</p>
            <p>────────────────────────────────</p>
            <p></p>
            `;

            editorRef.current.insertContent(text);
            toast.success(`${formula.name} adicionado!`);
        }
    };

    const handleOpenPrintParams = (type: 'simples' | 'controlada') => {
        setPrescriptionType(type);
        if (editorRef.current) {
            setEditorContent(editorRef.current.getHTML());
        }
        setIsPrintModalOpen(true);
    };

    const handleGeneratePreview = (params: PrintParameters) => {
        setPrintParams(params);
        setIsPrintModalOpen(false);
        setIsPreviewModalOpen(true);
    };

    if (!patient) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden relative">
            <PatientHeader
                name={patient.name}
                age={calculateAge(patient.birthDate)}
                gender={patient.gender === 'M' ? 'Masculino' : 'Feminino'}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Esquerda: Editor (60%) */}
                <div className="flex-1 flex flex-col h-full p-4 gap-4 overflow-hidden relative">
                    <div className="flex gap-2">
                        <Input placeholder="Nome da Receita (ex: Antibióticos)" className="bg-white" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-2 border-b bg-gray-50 text-xs text-gray-500 font-medium">
                            Receituário Simples
                        </div>
                        <div className="h-full">
                            <RichEditor
                                ref={editorRef}
                                placeholder="Digite a prescrição..."
                            />
                        </div>
                    </div>
                    {/* Footer Actions */}
                    <div className="h-16 bg-white border-t -mx-4 -mb-4 px-4 flex items-center justify-between">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => handleOpenPrintParams('controlada')}>
                                <FileWarning className="w-4 h-4 mr-2" /> Controle Especial
                            </Button>
                            <Button variant="outline" onClick={() => handleOpenPrintParams('simples')}>
                                <Printer className="w-4 h-4 mr-2" /> Imprimir Simples
                            </Button>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => handleOpenPrintParams('simples')}
                            >
                                <Copy className="w-4 h-4 mr-2" /> Salvar e Finalizar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Direita: Presets (40%) */}
                <FormulasPanel onSelectFormula={handleSelectFormula} />
            </div>

            {/* Modals */}
            <PrintParametersModal
                open={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                onGenerate={handleGeneratePreview}
                doctorName="Dr. Paulo Guimarães Jr."
                patientName={patient.name}
                type={prescriptionType}
            />

            <PrescriptionPreviewModal
                open={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                content={editorContent}
                params={printParams}
                patient={patient}
            />
        </div>
    );
}
