'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, X, Star, UserPlus, RefreshCw, Crown, Heart, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import api from '@/lib/api';

interface PatientTagsProps {
    patientId: string;
    currentTags: string[];
    onTagsUpdate?: (tags: string[]) => void;
}

// Predefined tags with colors and icons
const PREDEFINED_TAGS = [
    { name: 'VIP', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Crown },
    { name: 'Novo', color: 'bg-green-100 text-green-800 border-green-300', icon: UserPlus },
    { name: 'Recorrente', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: RefreshCw },
    { name: 'Indicação', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Heart },
    { name: 'Corporativo', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: Briefcase },
    { name: 'Prioritário', color: 'bg-red-100 text-red-800 border-red-300', icon: Star },
];

export function PatientTags({ patientId, currentTags = [], onTagsUpdate }: PatientTagsProps) {
    const [tags, setTags] = useState<string[]>(currentTags);
    const [newTag, setNewTag] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const updateTagsMutation = useMutation({
        mutationFn: async (newTags: string[]) => {
            const res = await api.put(`/patients/${patientId}/tags`, { tags: newTags });
            return res.data;
        },
        onSuccess: (_, newTags) => {
            setTags(newTags);
            onTagsUpdate?.(newTags);
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patient-stats'] });
        },
    });

    const addTag = (tagName: string) => {
        if (!tagName.trim() || tags.includes(tagName)) return;
        const newTags = [...tags, tagName];
        updateTagsMutation.mutate(newTags);
        setNewTag('');
    };

    const removeTag = (tagName: string) => {
        const newTags = tags.filter(t => t !== tagName);
        updateTagsMutation.mutate(newTags);
    };

    const getTagStyle = (tagName: string) => {
        const predefined = PREDEFINED_TAGS.find(t => t.name === tagName);
        if (predefined) return predefined.color;
        return 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getTagIcon = (tagName: string) => {
        const predefined = PREDEFINED_TAGS.find(t => t.name === tagName);
        if (predefined) {
            const IconComponent = predefined.icon;
            return <IconComponent className="w-3 h-3 mr-1" />;
        }
        return <Tag className="w-3 h-3 mr-1" />;
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
                {tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="outline"
                        className={`${getTagStyle(tag)} flex items-center gap-1 pr-1`}
                    >
                        {getTagIcon(tag)}
                        {tag}
                        <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                            <Plus className="w-3 h-3 mr-1" />
                            Tag
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Adicionar Tag</p>

                            {/* Predefined Tags */}
                            <div className="flex flex-wrap gap-1">
                                {PREDEFINED_TAGS.filter(t => !tags.includes(t.name)).map((tag) => {
                                    const IconComponent = tag.icon;
                                    return (
                                        <button
                                            key={tag.name}
                                            onClick={() => addTag(tag.name)}
                                            className={`${tag.color} border rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:opacity-80 transition-opacity`}
                                        >
                                            <IconComponent className="w-3 h-3" />
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Tag */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Tag personalizada..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addTag(newTag);
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={() => addTag(newTag)}
                                    disabled={!newTag.trim()}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}

// Compact version for lists
export function PatientTagsBadges({ tags = [] }: { tags: string[] }) {
    return (
        <div className="flex items-center gap-1 flex-wrap">
            {tags.slice(0, 3).map((tag) => {
                const predefined = PREDEFINED_TAGS.find(t => t.name === tag);
                const color = predefined?.color || 'bg-gray-100 text-gray-700';
                return (
                    <Badge key={tag} variant="outline" className={`${color} text-[10px] px-1.5 py-0`}>
                        {tag}
                    </Badge>
                );
            })}
            {tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{tags.length - 3}
                </Badge>
            )}
        </div>
    );
}
