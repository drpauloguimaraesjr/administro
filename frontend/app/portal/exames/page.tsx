'use client';

import { useEffect, useState, useRef } from 'react';
import { usePortalAuth } from '@/components/portal/portal-auth-provider';
import { PortalNav } from '@/components/portal/portal-nav';
import { fetchPatientExams, uploadPatientExam, submitExamAccessCode, uploadExamAccessPhoto } from '@/lib/portal-api';

export default function ExamesPage() {
    const { user, loading } = usePortalAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadMode, setUploadMode] = useState<'file' | 'code'>('file');

    // File mode states
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadDate, setUploadDate] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Code mode states
    const [labName, setLabName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [password, setPassword] = useState('');
    const [accessPhoto, setAccessPhoto] = useState<File | null>(null);
    const accessPhotoInputRef = useRef<HTMLInputElement>(null);

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
        setUploading(true);
        try {
            if (uploadMode === 'file') {
                if (!selectedFile || !uploadTitle.trim()) return;
                await uploadPatientExam(selectedFile, uploadTitle, uploadDesc, uploadDate);
            } else {
                if (accessPhoto) {
                    await uploadExamAccessPhoto(accessPhoto, uploadDesc, uploadDate);
                } else {
                    if (!labName.trim() || !accessCode.trim()) return;
                    await submitExamAccessCode({
                        labName,
                        accessCode,
                        password,
                        notes: uploadDesc,
                        examDate: uploadDate
                    });
                }
            }
            resetStates();
            await loadExams();
        } catch (error) {
            console.error('Erro ao enviar exame:', error);
            alert('Erro ao enviar exame. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const resetStates = () => {
        setShowUpload(false);
        setSelectedFile(null);
        setUploadTitle('');
        setUploadDesc('');
        setUploadDate('');
        setLabName('');
        setAccessCode('');
        setPassword('');
        setAccessPhoto(null);
        setUploadMode('file');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
            setSelectedFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
            setUploadMode('file');
            setShowUpload(true);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
            setUploadMode('file');
            setShowUpload(true);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PortalNav />
            <main className="max-w-4xl mx-auto px-4 pt-8 pb-24 md:ml-64 lg:ml-72 md:pb-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">🔬 Meus Exames</h1>
                        <p className="text-slate-500 text-sm">Envie resultados ou códigos de laboratório</p>
                    </div>
                    <button
                        onClick={() => { setShowUpload(true); setUploadMode('file'); }}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <span className="text-lg">+</span> Enviar Novo
                    </button>
                </div>

                {/* Upload Modal */}
                {showUpload && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl relative">
                            <button
                                onClick={resetStates}
                                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="text-xl font-bold text-slate-900 mb-6">Como deseja enviar?</h2>

                            {/* Mode Selector */}
                            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                                <button
                                    onClick={() => setUploadMode('file')}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${uploadMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    📄 PDF ou Imagem
                                </button>
                                <button
                                    onClick={() => setUploadMode('code')}
                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${uploadMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    🔑 Código de Acesso
                                </button>
                            </div>

                            {uploadMode === 'file' ? (
                                <div className="space-y-6">
                                    {!selectedFile ? (
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${dragOver
                                                ? 'border-blue-500 bg-blue-50/50'
                                                : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
                                                }`}
                                        >
                                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📄</div>
                                            <p className="text-slate-900 font-bold">Arraste seu PDF aqui</p>
                                            <p className="text-slate-400 text-sm mt-1">Ou clique para selecionar (Máx 20MB)</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,image/*"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 mb-6">
                                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">📄</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                                                <p className="text-xs font-medium text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                            </div>
                                            <button onClick={() => setSelectedFile(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título do Exame</label>
                                            <input
                                                type="text"
                                                value={uploadTitle}
                                                onChange={(e) => setUploadTitle(e.target.value)}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                placeholder="Ex: Hemograma completo"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50 flex gap-3 mb-2">
                                        <span className="text-xl">🤖</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-amber-800 font-bold leading-relaxed">
                                                Envie os dados ou uma foto do cartão e deixe o resto com nossa IA.
                                            </p>
                                            <p className="text-[10px] text-amber-700 mt-0.5">
                                                Você receberá uma notificação por email assim que o processamento for concluído.
                                            </p>
                                        </div>
                                    </div>

                                    {!accessPhoto ? (
                                        <div className="grid grid-cols-1 gap-4 text-left">
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Laboratório / Site</label>
                                                    <input
                                                        type="text"
                                                        value={labName}
                                                        onChange={(e) => setLabName(e.target.value)}
                                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                                        placeholder="Ex: Fleury, Delboni..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usuário / Código</label>
                                                    <input
                                                        type="text"
                                                        value={accessCode}
                                                        onChange={(e) => setAccessCode(e.target.value)}
                                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                                        placeholder="Código"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                                        placeholder="••••"
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative py-4 flex items-center gap-4">
                                                <div className="flex-1 h-[1px] bg-slate-100" />
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ou se preferir</span>
                                                <div className="flex-1 h-[1px] bg-slate-100" />
                                            </div>

                                            <button
                                                onClick={() => accessPhotoInputRef.current?.click()}
                                                className="w-full py-4 border-2 border-dashed border-blue-100 rounded-2xl bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-1 group"
                                            >
                                                <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                                                <span className="text-xs font-bold text-blue-600">Tirar Foto do Cartão ou Anexar Print</span>
                                                <span className="text-[9px] text-blue-400">A IA extrairá os dados automaticamente</span>
                                                <input
                                                    ref={accessPhotoInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setAccessPhoto(file);
                                                    }}
                                                />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📸</div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-bold text-blue-900 truncate">{accessPhoto.name}</p>
                                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Foto capturada para IA</p>
                                            </div>
                                            <button onClick={() => setAccessPhoto(null)} className="p-2 text-blue-400 hover:text-red-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Common fields (Date & Desc) */}
                            <div className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Data do Exame</label>
                                        <input
                                            type="date"
                                            value={uploadDate}
                                            onChange={(e) => setUploadDate(e.target.value)}
                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Observações Extra</label>
                                    <textarea
                                        value={uploadDesc}
                                        onChange={(e) => setUploadDesc(e.target.value)}
                                        rows={2}
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                                        placeholder="Alguma nota importante?"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'code' && !accessPhoto && (!labName || !accessCode))}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </span>
                                    ) : 'Finalizar Envio'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exams List */}
                {loadingData ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse h-24" />
                        ))}
                    </div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📎</div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Tudo pronto para receber seus exames</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">Arraste seus arquivos PDF ou envie seus códigos de acesso laboratorial.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exams.map((exam: any) => (
                            <div key={exam.id} className="group bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm shadow-slate-200/20 hover:shadow-lg hover:border-blue-100 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${exam.method === 'access_code' || exam.method === 'access_photo' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {exam.method === 'access_code' ? '🔑' : exam.method === 'access_photo' ? '📸' : '📄'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-900 truncate">{exam.title}</h3>
                                            {exam.status === 'processing_ai' && (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-tighter border border-amber-100">
                                                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                                                    Processando pela IA
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-400">
                                            {exam.examDate && (
                                                <span className="flex items-center gap-1">📅 {new Date(exam.examDate).toLocaleDateString('pt-BR')}</span>
                                            )}
                                            <span className="flex items-center gap-1">🕒 {new Date(exam.uploadedAt).toLocaleDateString('pt-BR')}</span>
                                            {exam.labName && (
                                                <span className="flex items-center gap-1">🏥 {exam.labName}</span>
                                            )}
                                        </div>
                                    </div>
                                    {exam.downloadUrl ? (
                                        <a
                                            href={exam.downloadUrl}
                                            target="_blank"
                                            rel="noopener"
                                            className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-xl transition-all border border-slate-100 hover:border-blue-200"
                                        >
                                            Abrir
                                        </a>
                                    ) : exam.method === 'access_code' ? (
                                        <div className="px-4 py-2 bg-slate-50 text-slate-400 text-xs font-bold rounded-xl border border-slate-100">
                                            Aguardando IA
                                        </div>
                                    ) : null}
                                </div>
                                {exam.description && (
                                    <div className="mt-4 pt-4 border-t border-slate-50">
                                        <p className="text-xs text-slate-500 leading-relaxed italic">"{exam.description}"</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
