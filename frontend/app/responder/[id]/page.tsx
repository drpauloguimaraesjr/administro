'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface Question {
    id: string;
    text: string;
    type: string;
    required: boolean;
    options?: string[];
}

interface Section {
    id: string;
    title: string;
    questions: Question[];
}

export default function ResponderQuestionarioPage() {
    const params = useParams();
    const router = useRouter();
    const responseId = params.id as string;
    const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
    const [submitted, setSubmitted] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['questionnaire-response', responseId],
        queryFn: async () => {
            const res = await api.get(`/questionnaires/responses/${responseId}`);
            return res.data;
        },
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
                const question = data?.questionnaire?.sections
                    ?.flatMap((s: Section) => s.questions)
                    ?.find((q: Question) => q.id === questionId);
                return {
                    questionId,
                    questionText: question?.text || '',
                    value,
                };
            });
            return api.post(`/questionnaires/responses/${responseId}/submit`, { answers: formattedAnswers });
        },
        onSuccess: () => {
            setSubmitted(true);
        },
    });

    const updateAnswer = (questionId: string, value: any) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold mb-2">Questionário não encontrado</h2>
                    <p className="text-muted-foreground">Este link pode ter expirado ou ser inválido.</p>
                </div>
            </div>
        );
    }

    if (data.response.status === 'completed' || submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md"
                >
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-bold mb-2">Obrigado!</h2>
                    <p className="text-muted-foreground">
                        Suas respostas foram enviadas com sucesso. Agradecemos sua participação!
                    </p>
                </motion.div>
            </div>
        );
    }

    const { questionnaire, response } = data;
    const totalQuestions = questionnaire.sections?.reduce(
        (acc: number, s: Section) => acc + s.questions.length, 0
    ) || 0;
    const answeredQuestions = Object.keys(answers).length;
    const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    return (
        <main className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6">
                        <h1 className="text-2xl font-bold">{questionnaire.title}</h1>
                        {questionnaire.description && (
                            <p className="text-teal-100 mt-2">{questionnaire.description}</p>
                        )}
                        <p className="text-sm text-teal-200 mt-4">
                            Olá, {response.patientName}!
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="px-6 py-4 border-b">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-teal-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="p-6 space-y-8">
                        {questionnaire.sections?.map((section: Section, sIndex: number) => (
                            <div key={section.id}>
                                <h2 className="text-lg font-semibold mb-4 text-teal-700">
                                    {section.title}
                                </h2>

                                <div className="space-y-6">
                                    {section.questions.map((question: Question, qIndex: number) => (
                                        <div key={question.id} className="space-y-2">
                                            <label className="block font-medium">
                                                {sIndex * 10 + qIndex + 1}. {question.text}
                                                {question.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>

                                            {question.type === 'text' && (
                                                <Input
                                                    value={answers[question.id] || ''}
                                                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                                                    placeholder="Sua resposta..."
                                                />
                                            )}

                                            {question.type === 'textarea' && (
                                                <textarea
                                                    value={answers[question.id] || ''}
                                                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                                                    className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background resize-none"
                                                    placeholder="Sua resposta..."
                                                />
                                            )}

                                            {question.type === 'number' && (
                                                <Input
                                                    type="number"
                                                    value={answers[question.id] || ''}
                                                    onChange={(e) => updateAnswer(question.id, e.target.value)}
                                                    placeholder="0"
                                                />
                                            )}

                                            {question.type === 'radio' && question.options && (
                                                <div className="space-y-2">
                                                    {question.options.map((option) => (
                                                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={question.id}
                                                                value={option}
                                                                checked={answers[question.id] === option}
                                                                onChange={(e) => updateAnswer(question.id, e.target.value)}
                                                                className="w-4 h-4 text-teal-600"
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {question.type === 'checkbox' && question.options && (
                                                <div className="space-y-2">
                                                    {question.options.map((option) => (
                                                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(answers[question.id] || []).includes(option)}
                                                                onChange={(e) => {
                                                                    const current = answers[question.id] || [];
                                                                    if (e.target.checked) {
                                                                        updateAnswer(question.id, [...current, option]);
                                                                    } else {
                                                                        updateAnswer(question.id, current.filter((v: string) => v !== option));
                                                                    }
                                                                }}
                                                                className="w-4 h-4 text-teal-600"
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}

                                            {question.type === 'scale' && (
                                                <div className="flex justify-between items-center py-2">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                        <button
                                                            key={n}
                                                            type="button"
                                                            onClick={() => updateAnswer(question.id, n)}
                                                            className={`w-8 h-8 rounded-full border transition-all ${answers[question.id] === n
                                                                    ? 'bg-teal-600 text-white border-teal-600'
                                                                    : 'border-gray-300 hover:border-teal-400'
                                                                }`}
                                                        >
                                                            {n}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="p-6 border-t bg-slate-50">
                        <Button
                            onClick={() => submitMutation.mutate()}
                            disabled={submitMutation.isPending}
                            className="w-full bg-teal-600 hover:bg-teal-700"
                        >
                            {submitMutation.isPending ? 'Enviando...' : 'Enviar Respostas'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
