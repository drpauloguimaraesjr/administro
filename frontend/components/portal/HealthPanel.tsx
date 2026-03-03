'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Thermometer, User, Clipboard, ChevronRight, BarChart3, Info, TrendingUp } from 'lucide-react';
import { fetchClinicalSummary, fetchAssessments } from '@/lib/portal-api';

export function HealthPanel() {
    const [summary, setSummary] = useState<any>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'assessments' | 'clinical'>('assessments');

    useEffect(() => {
        async function loadData() {
            try {
                const [summaryData, assessmentData] = await Promise.all([
                    fetchClinicalSummary(),
                    fetchAssessments()
                ]);
                setSummary(summaryData);
                setAssessments(assessmentData);
            } catch (error) {
                console.error('Erro ao carregar dados de saúde:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('assessments')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'assessments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Painel de Saúde
                    </button>
                    <button
                        onClick={() => setActiveTab('clinical')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'clinical' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Histórico Clínico
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'assessments' ? (
                    <motion.div
                        key="assessments"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {/* Bioimpedância */}
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Bioimpedância</h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider tabular-nums">Última: {new Date(assessments.find(a => a.type === 'bioimpedance')?.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {assessments.find(a => a.type === 'bioimpedance')?.metrics && (
                                    <>
                                        <MetricRow label="Peso" value={`${assessments.find(a => a.type === 'bioimpedance').metrics.weight} kg`} color="text-blue-600" />
                                        <MetricRow label="Gordura Corporal" value={`${assessments.find(a => a.type === 'bioimpedance').metrics.bodyFat}%`} color="text-rose-500" />
                                        <MetricRow label="Massa Muscular" value={`${assessments.find(a => a.type === 'bioimpedance').metrics.muscleMass} kg`} color="text-emerald-500" />
                                        <MetricRow label="Idade Metabólica" value={`${assessments.find(a => a.type === 'bioimpedance').metrics.metabolicAge} anos`} color="text-amber-500" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Calorimetria */}
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                    <Thermometer size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Calorimetria</h3>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider tabular-nums">Resumo Metabólico</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {assessments.find(a => a.type === 'calorimetry')?.metrics && (
                                    <>
                                        <MetricRow label="Taxa Metabólica Basal" value={`${assessments.find(a => a.type === 'calorimetry').metrics.basalMetabolicRate} kcal`} color="text-orange-600" />
                                        <MetricRow label="Gasto Total Estimado" value={`${assessments.find(a => a.type === 'calorimetry').metrics.totalExpenditure} kcal`} color="text-blue-600" />
                                        <MetricRow label="Quociente Respiratório" value={assessments.find(a => a.type === 'calorimetry').metrics.respiratoryQuotient} color="text-slate-600" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Insights de IA */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 shadow-lg shadow-indigo-200 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <BarChart3 size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                    <Bot size={12} className="text-white" />
                                    <span>Análise da IA</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2">Seu metabolismo está excelente!</h3>
                                <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                                    Sua taxa metabólica está 15% acima da média para sua idade, indicando uma boa eficiência mitocondrial e massa muscular ativa.
                                </p>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/20">
                                    Ver Relatório Completo
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="clinical"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Anamnese */}
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Clipboard size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Breve Anamnese</h3>
                            </div>
                            {summary?.anamnesis ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queixa Principal / Objetivos</p>
                                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                            {summary.anamnesis.mainComplaint || 'Não informado'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Histórico Patológico (HPP)</p>
                                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                            {summary.anamnesis.hpp || 'Nenhum histórico registrado'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Nenhuma anamnese registrada.</p>
                            )}
                        </div>

                        {/* Evoluções mais recentes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2 px-2">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Últimas Evoluções</h3>
                            </div>
                            {summary?.evolutions?.length > 0 ? (
                                summary.evolutions.map((evol: any) => (
                                    <div key={evol.id} className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm hover:border-blue-100 transition-all group">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                {new Date(evol.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-[9px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-lg">Dr(a). {evol.doctor}</span>
                                        </div>
                                        <div
                                            className="text-xs text-slate-600 leading-relaxed line-clamp-3 overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: evol.content }}
                                        />
                                        <button className="mt-3 flex items-center gap-1 text-blue-500 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            Ver Completa <ChevronRight size={12} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic px-2">Ainda não há evoluções clínicas registradas.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MetricRow({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 group">
            <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors">{label}</span>
            <span className={`text-sm font-black ${color} tracking-tight tabular-nums`}>{value}</span>
        </div>
    );
}

function Bot(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}
