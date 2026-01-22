'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Save } from 'lucide-react';

export function ImportantData() {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader
                className="py-3 px-4 cursor-pointer hover:bg-gray-50 flex flex-row items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Dados Importantes
                </CardTitle>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-4 pt-0 space-y-4 bg-gray-50/50">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-600">Diagnósticos</Label>
                        <Textarea
                            className="resize-none h-14 text-sm bg-white"
                            placeholder="Principais diagnósticos..."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-600">Pontos chaves da HPP</Label>
                        <Textarea
                            className="resize-none h-14 text-sm bg-white"
                            placeholder="Histórico patológico pregresso..."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-600">Medicamentos em uso</Label>
                        <Textarea
                            className="resize-none h-14 text-sm bg-white"
                            placeholder="Lista de medicamentos..."
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-600">Alergias</Label>
                        <Textarea
                            className="resize-none h-14 text-sm bg-white"
                            placeholder="Alergias conhecidas..."
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-8 text-xs">
                            <Save className="w-3 h-3 mr-2" />
                            Salvar Dados
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
