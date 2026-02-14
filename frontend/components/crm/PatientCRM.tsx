'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserPlus, FileText, StickyNote, ClipboardList,
    Calendar, Trash2, Plus, Send, AlertCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import api from '@/lib/api';

interface TimelineEvent {
    id?: string;
    type: string;
    title: string;
    content?: string;
    date: string;
    icon: string;
}

interface Note {
    id: string;
    content: string;
    type: 'general' | 'alert' | 'follow-up';
    createdAt: string;
    createdBy: string;
}

interface PatientTimelineProps {
    patientId: string;
}

export function PatientTimeline({ patientId }: PatientTimelineProps) {
    const { data: timeline = [], isLoading } = useQuery<TimelineEvent[]>({
        queryKey: ['patient-timeline', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}/timeline`);
            return res.data;
        },
    });

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'user-plus': return <UserPlus className="w-4 h-4" />;
            case 'file-text': return <FileText className="w-4 h-4" />;
            case 'sticky-note': return <StickyNote className="w-4 h-4" />;
            case 'clipboard-list': return <ClipboardList className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'patient_created': return 'bg-primary/100';
            case 'prescription': return 'bg-primary/100';
            case 'note': return 'bg-amber-500';
            case 'anamnesis': return 'bg-primary/100';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
                {timeline.map((event, index) => (
                    <div key={`${event.type}-${event.date}-${index}`} className="relative flex gap-4">
                        {/* Icon */}
                        <div className={`relative z-10 w-10 h-10 rounded-full ${getTypeColor(event.type)} flex items-center justify-center text-white `}>
                            {getIcon(event.icon)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-white rounded-lg border p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{event.title}</p>
                                    {event.content && (
                                        <p className="text-sm text-gray-600 mt-1">{event.content}</p>
                                    )}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {event.type === 'prescription' ? 'Receita' :
                                        event.type === 'note' ? 'Nota' :
                                            event.type === 'anamnesis' ? 'Anamnese' : 'Cadastro'}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(event.date)}
                            </p>
                        </div>
                    </div>
                ))}

                {timeline.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                        Nenhum evento registrado ainda.
                    </p>
                )}
            </div>
        </div>
    );
}

interface PatientNotesProps {
    patientId: string;
}

export function PatientNotes({ patientId }: PatientNotesProps) {
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<'general' | 'alert' | 'follow-up'>('general');
    const queryClient = useQueryClient();

    const { data: notes = [], isLoading } = useQuery<Note[]>({
        queryKey: ['patient-notes', patientId],
        queryFn: async () => {
            const res = await api.get(`/patients/${patientId}/notes`);
            return res.data;
        },
    });

    const addNoteMutation = useMutation({
        mutationFn: async (note: { content: string; type: string }) => {
            const res = await api.post(`/patients/${patientId}/notes`, note);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
            queryClient.invalidateQueries({ queryKey: ['patient-timeline', patientId] });
            setNewNote('');
        },
    });

    const deleteNoteMutation = useMutation({
        mutationFn: async (noteId: string) => {
            await api.delete(`/patients/${patientId}/notes/${noteId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
            queryClient.invalidateQueries({ queryKey: ['patient-timeline', patientId] });
        },
    });

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        addNoteMutation.mutate({ content: newNote, type: noteType });
    };

    const getNoteTypeColor = (type: string) => {
        switch (type) {
            case 'alert': return 'border-l-red-500 bg-destructive/10';
            case 'follow-up': return 'border-l-amber-500 bg-amber-50';
            default: return 'border-l-blue-500 bg-primary/10';
        }
    };

    const getNoteTypeLabel = (type: string) => {
        switch (type) {
            case 'alert': return 'Alerta';
            case 'follow-up': return 'Follow-up';
            default: return 'Geral';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-amber-500" />
                    Observações
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Note Form */}
                <div className="space-y-2">
                    <Textarea
                        placeholder="Adicionar uma observação..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                        <Select value={noteType} onValueChange={(v) => setNoteType(v as any)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">Geral</SelectItem>
                                <SelectItem value="alert">Alerta</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleAddNote}
                            disabled={!newNote.trim() || addNoteMutation.isPending}
                            className="flex-1"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar Nota
                        </Button>
                    </div>
                </div>

                {/* Notes List */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2].map(i => (
                            <div key={i} className="animate-pulse h-16 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                ) : notes.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhuma observação registrada.</p>
                ) : (
                    <div className="space-y-2">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={`p-3 rounded-lg border-l-4 ${getNoteTypeColor(note.type)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {note.type === 'alert' && <AlertCircle className="w-4 h-4 text-destructive" />}
                                            {note.type === 'follow-up' && <Clock className="w-4 h-4 text-amber-500" />}
                                            <Badge variant="outline" className="text-xs">
                                                {getNoteTypeLabel(note.type)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700">{note.content}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatDate(note.createdAt)}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteNoteMutation.mutate(note.id)}
                                        className="text-destructive hover:text-red-700 hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
