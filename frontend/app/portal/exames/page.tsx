'use client';

import { useEffect, useState, useRef } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { fetchPatientExams, uploadPatientExam } from '@/lib/portal-api';

export default function ExamesPage() {
    const { user, loading } = usePortalAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadDate, setUploadDate] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        loadExams();
    }, [user]);

    const loadExams = async () => {
        try {
            const data = await fetchPatientExams();
            setExams(data);
        } catch (error) {
            console.error('Erro ao carregar exames:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadTitle.trim()) return;

        setUploading(true);
        try {
            await uploadPatientExam(selectedFile, uploadTitle, uploadDesc, uploadDate);
            setShowUpload(false);
            setSelectedFile(null);
            setUploadTitle('');
            setUploadDesc('');
            setUploadDate('');
            await loadExams();
        } catch (error) {
            console.error('Erro ao enviar exame:', error);
            alert('Erro ao enviar exame. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
            setSelectedFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
            setShowUpload(true);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
            setShowUpload(true);
        }
    };

    if (loading) return null;

    return (
        <>
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:ml-56 md:pb-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">🔬 Meus Exames</h1>
                    <button
                        onClick={() => { setShowUpload(true); setSelectedFile(null); }}
                        className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm"
                    >
                        + Enviar Exame
                    </button>
                </div>

                {/* Upload Modal */}
                {showUpload && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Exame</h2>

                            {/* Drop zone */}
                            {!selectedFile ? (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <p className="text-3xl mb-2">📄</p>
                                    <p className="text-sm text-gray-600">Arraste um PDF ou clique para selecionar</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF ou imagem, até 20MB</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* File selected */}
                                    <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                                        <span className="text-xl">📄</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="text-gray-400 hover:text-red-500 text-sm"
                                        >✕</button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Título do exame *
                                            </label>
                                            <input
                                                type="text"
                                                value={uploadTitle}
                                                onChange={(e) => setUploadTitle(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                                                placeholder="Ex: Hemograma completo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Data do exame
                                            </label>
                                            <input
                                                type="date"
                                                value={uploadDate}
                                                onChange={(e) => setUploadDate(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Observações
                                            </label>
                                            <textarea
                                                value={uploadDesc}
                                                onChange={(e) => setUploadDesc(e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none resize-none"
                                                placeholder="Alguma observação sobre o exame..."
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 mt-5">
                                <button
                                    onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                                    className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || !uploadTitle.trim() || uploading}
                                    className="flex-1 py-2.5 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {uploading ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exams List */}
                {loadingData ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : exams.length === 0 ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`text-center py-16 rounded-2xl border-2 border-dashed transition-all ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400'
                            }`}
                    >
                        <p className="text-4xl mb-3">🔬</p>
                        <p>Nenhum exame enviado</p>
                        <p className="text-sm mt-1">Arraste um PDF aqui ou clique em "Enviar Exame"</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {exams.map((exam: any) => (
                            <div key={exam.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📄</span>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{exam.title}</h3>
                                        <div className="flex gap-3 text-sm text-gray-500">
                                            {exam.examDate && (
                                                <span>Data: {new Date(exam.examDate).toLocaleDateString('pt-BR')}</span>
                                            )}
                                            <span>Enviado: {new Date(exam.uploadedAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        {exam.description && (
                                            <p className="text-xs text-gray-400 mt-1">{exam.description}</p>
                                        )}
                                    </div>
                                    {exam.downloadUrl && (
                                        <a
                                            href={exam.downloadUrl}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                        >
                                            📥 Ver
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
