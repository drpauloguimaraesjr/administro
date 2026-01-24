'use client';

import { useState } from 'react';
import { usePrescriptionFormulas } from '@/hooks/usePrescriptionFormulas';
import { PrescriptionFormula } from '@/types/prescription';
import { Search, Plus, Filter, Pill, Syringe, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FORMULAS_DATA } from '@/data/formulas-db';

interface FormulasPanelProps {
    onSelectFormula: (formula: PrescriptionFormula) => void;
}

export function FormulasPanel({ onSelectFormula }: FormulasPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const { formulas: dbFormulas, loading } = usePrescriptionFormulas(searchTerm);

    // Fallback to local full database if API is empty
    const allFormulas = dbFormulas.length > 0 ? dbFormulas : FORMULAS_DATA;

    const filteredFormulas = allFormulas.filter(f => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = f.name?.toLowerCase().includes(term) ||
            f.usage?.toLowerCase().includes(term) ||
            f.category?.toLowerCase().includes(term);

        const matchesCategory = categoryFilter
            ? (f.category?.includes(categoryFilter) || f.usage?.includes(categoryFilter) || f.name?.toUpperCase().includes(categoryFilter.toUpperCase().slice(0, -1)))
            : true;

        if (categoryFilter === 'Injetáveis') {
            return (f.category === 'Injetáveis' || f.usage?.includes('IM') || f.usage?.includes('EV') || f.usage?.includes('SC')) && matchesSearch;
        }

        if (categoryFilter === 'Vitaminas') {
            return (f.name.includes('VITAMINA') || f.category === 'Vitaminas') && matchesSearch;
        }

        if (categoryFilter === 'Hormônios') {
            return (f.category === 'Hormônios' || f.name.includes('TESTOSTERONA') || f.name.includes('ESTRADIOL') || f.name.includes('HORMONIO')) && matchesSearch;
        }

        return matchesSearch && matchesCategory;
    });


    return (
        <div className="w-[400px] border-l border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm z-10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        📚 Biblioteca de Fórmulas
                    </h3>
                    <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100">
                        {filteredFormulas.length} itens
                    </Badge>
                </div>

                {/* Busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome, uso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors h-9 text-sm"
                    />
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                    <Button
                        variant={categoryFilter === null ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setCategoryFilter(null)}
                        className={`h-6 text-[10px] px-2 rounded-full ${categoryFilter === null ? 'border-purple-200 bg-purple-50 text-purple-700' : 'text-gray-500'}`}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={categoryFilter === 'Injetáveis' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setCategoryFilter('Injetáveis')}
                        className={`h-6 text-[10px] px-2 rounded-full ${categoryFilter === 'Injetáveis' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'text-gray-500'}`}
                    >
                        Injetáveis
                    </Button>
                    <Button
                        variant={categoryFilter === 'Vitaminas' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setCategoryFilter('Vitaminas')}
                        className={`h-6 text-[10px] px-2 rounded-full ${categoryFilter === 'Vitaminas' ? 'border-green-200 bg-green-50 text-green-700' : 'text-gray-500'}`}
                    >
                        Vitaminas
                    </Button>
                    <Button
                        variant={categoryFilter === 'Hormônios' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setCategoryFilter('Hormônios')}
                        className={`h-6 text-[10px] px-2 rounded-full ${categoryFilter === 'Hormônios' ? 'border-orange-200 bg-orange-50 text-orange-700' : 'text-gray-500'}`}
                    >
                        Hormônios
                    </Button>
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50">
                {loading ? (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 h-16">
                                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredFormulas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center p-4">
                        <Search className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma fórmula encontrada para &quot;{searchTerm}&quot;</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Resultados</span>
                            <span className="text-gray-300 text-[9px]">Clique na seta para inserir</span>
                        </div>
                        {filteredFormulas.map((formula) => (
                            <FormulaCard
                                key={formula.id}
                                formula={formula}
                                onSelect={() => onSelectFormula(formula)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-white">
                <Button
                    variant="ghost"
                    className="w-full justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-9"
                    onClick={() => {
                        // TODO: Implement create modal
                        alert('Funcionalidade de criar nova fórmula em desenvolvimento');
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Fórmula Personalizada
                </Button>
            </div>
        </div>
    );
}

// Card individual
function FormulaCard({ formula, onSelect }: { formula: PrescriptionFormula; onSelect: () => void }) {
    // Helper to determine icon based on category/name (simple logic)
    const getIcon = () => {
        const n = formula.name.toUpperCase();
        if (n.includes('VITAMINA')) return <Pill className="w-3 h-3" />;
        if (n.includes('TESTOSTERONA') || n.includes('HORM')) return <Syringe className="w-3 h-3" />;
        return <TestTube className="w-3 h-3" />;
    };

    return (
        <TooltipProvider>
            <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                    <div className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all cursor-default">

                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className={`p-1 rounded-md ${formula.category === 'Hormônios' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {getIcon()}
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-xs truncate leading-tight" title={formula.name}>
                                        {formula.name}
                                    </h4>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                                    <div className="text-[10px] text-gray-500 truncate">
                                        <span className="font-medium text-gray-400">Dosagem:</span> {formula.dosage || '-'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 truncate">
                                        <span className="font-medium text-gray-400">Via:</span> {formula.usage || '-'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 truncate col-span-2">
                                        <span className="font-medium text-gray-400">Fornecedor:</span> {formula.supplier || '-'}
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-full shrink-0 -mr-1 -mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect();
                                }}
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="w-64 p-3 bg-slate-800 text-slate-100 border-slate-700">
                    <p className="font-bold text-xs mb-1">{formula.name}</p>
                    <p className="text-[10px] opacity-90 leading-relaxed line-clamp-6">{formula.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
