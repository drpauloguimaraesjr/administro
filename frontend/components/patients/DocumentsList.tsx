'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Image, Trash2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Document {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
}

interface DocumentsListProps {
    patientId: string;
}

export function DocumentsList({ patientId }: DocumentsListProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { data: documents = [], isLoading } = useQuery({
        queryKey: ['documents', patientId],
        queryFn: async () => {
            const res = await api.get(`/medical-records/${patientId}/documents`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            api.delete(`/medical-records/${patientId}/documents/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
        },
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            formData.append('type', file.type.startsWith('image/') ? 'image' : 'document');

            await api.post(`/medical-records/${patientId}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload do arquivo');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = (doc: Document) => {
        if (confirm(`Excluir ${doc.name}?`)) {
            deleteMutation.mutate(doc.id);
        }
    };

    const getIcon = (type: string) => {
        return type === 'image' ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />;
    };

    if (isLoading) {
        return <div className="text-center py-8">Carregando...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Documentos</h3>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-primary hover:bg-teal-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Enviando...' : 'Upload'}
                    </Button>
                </div>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum documento anexado</p>
                    <p className="text-sm">Arraste ou clique em Upload para adicionar</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc: Document) => (
                        <div
                            key={doc.id}
                            className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
                        >
                            <div className="p-2 bg-teal-100 rounded text-primary">
                                {getIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(doc.url, '_blank')}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(doc)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
