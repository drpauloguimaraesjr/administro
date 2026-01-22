'use client';

import { FileText, Edit3, Star } from 'lucide-react';

export function Timeline() {
    const events = [
        {
            id: 1,
            date: '22/01/2026 10:25',
            user: 'DR. PAULO',
            type: 'document',
            title: 'PROTOCOLO INICIAL',
            content: '',
            icon: FileText
        },
        {
            id: 2,
            date: '22/01/2026 09:27',
            user: 'DR. PAULO',
            type: 'note',
            title: 'QUEIXA PRINCIPAL',
            content: 'desidrose. piora com irritante primário. esquecimento. sono - 23h e acorda às 07h30. sonolencia ao meio dia.',
            icon: Edit3
        }
    ];

    return (
        <div className="space-y-6">
            {events.map((evt) => (
                <div key={evt.id} className="relative pl-6 border-l border-gray-200 ml-2">
                    <div className="absolute -left-[9px] top-0 bg-white border border-gray-200 rounded-full w-4 h-4 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>

                    <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 uppercase font-semibold">
                        <span>{evt.date}</span>
                        <span>-</span>
                        <span>{evt.user}</span>
                        <div className="ml-auto flex gap-1">
                            <Star className="w-3 h-3 text-gray-300 hover:text-yellow-400 cursor-pointer" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-teal-500 transition-colors cursor-pointer group shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <evt.icon className="w-4 h-4 text-purple-600" />
                            <h4 className="font-bold text-sm text-gray-800">{evt.title}</h4>
                        </div>
                        {evt.content && (
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {evt.content}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
