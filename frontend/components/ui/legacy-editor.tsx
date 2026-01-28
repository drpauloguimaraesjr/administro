'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Indent, Outdent, Link as LinkIcon, Image as ImageIcon,
    Undo, Redo, Table as TableIcon, Type, Palette,
    Maximize, Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegacyEditorProps {
    content?: string;
    placeholder?: string;
    onChange?: (content: string) => void;
    editable?: boolean;
}

export interface LegacyEditorRef {
    insertContent: (content: string) => void;
    getHTML: () => string;
}

export const LegacyEditor = forwardRef<LegacyEditorRef, LegacyEditorProps>(({ content = '', placeholder, onChange, editable = true }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editor State
    const [foreColor, setForeColor] = useState('#000000');
    const [backColor, setBackColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState('3');

    // Margin State (in pixels)
    const [margins, setMargins] = useState({ top: 96, right: 96, bottom: 96, left: 96 }); // approx 2.54cm default
    const [showMargins, setShowMargins] = useState(true);
    const [isDragging, setIsDragging] = useState<null | 'top' | 'right' | 'bottom' | 'left'>(null);

    // Sync initial content
    useEffect(() => {
        if (editorRef.current && content && editorRef.current.innerHTML !== content) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    // Handle content changes
    const handleInput = () => {
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    useImperativeHandle(ref, () => ({
        insertContent: (html: string) => {
            if (editorRef.current) {
                editorRef.current.focus();
                document.execCommand('insertHTML', false, html);
                handleInput();
            }
        },
        getHTML: () => {
            return editorRef.current?.innerHTML || '';
        }
    }));

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const handleLink = () => {
        const url = prompt('Enter a URL:', 'http://');
        if (url) execCmd('createLink', url);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgHtml = `<img src="${event.target?.result}" style="max-width: 100%; height: auto;" />`;
                execCmd('insertHTML', imgHtml);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleTable = () => {
        const rows = prompt('Número de linhas?');
        const cols = prompt('Número de colunas?');

        if (rows && cols) {
            let html = '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc; margin: 10px 0;">';
            for (let i = 0; i < parseInt(rows); i++) {
                html += '<tr>';
                for (let j = 0; j < parseInt(cols); j++) {
                    html += '<td style="border: 1px solid #ccc; padding: 5px;"> - </td>';
                }
                html += '</tr>';
            }
            html += '</table><small>Fonte:</small><p></p>';
            execCmd('insertHTML', html);
        }
    };

    const applyColor = (type: 'foreColor' | 'backColor', color: string) => {
        if (type === 'foreColor') setForeColor(color);
        if (type === 'backColor') setBackColor(color);
        execCmd(type, color);
    };

    // --- Dragging Logic ---
    const handleMouseDown = (e: React.MouseEvent, side: 'top' | 'right' | 'bottom' | 'left') => {
        e.preventDefault();
        setIsDragging(side);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            // Calculate mouse position relative to the container (Paper)
            // Note: The guide lines are absolute to the Paper div, so check coordinates relative to that.
            // Actually, better to calculate relative to the inner content width/height constraints.

            // Getting the "Paper" element (first child of containerRef)
            const paperEl = containerRef.current.firstElementChild as HTMLElement;
            if (!paperEl) return;
            const paperRect = paperEl.getBoundingClientRect();

            const mouseX = e.clientX - paperRect.left;
            const mouseY = e.clientY - paperRect.top;

            // Limits (min 20px margin, max 200px)
            if (isDragging === 'left') {
                const newLeft = Math.min(Math.max(mouseX, 20), 200);
                setMargins(prev => ({ ...prev, left: newLeft }));
            }
            if (isDragging === 'right') {
                const newRight = Math.min(Math.max(paperRect.width - mouseX, 20), 200);
                setMargins(prev => ({ ...prev, right: newRight }));
            }
            if (isDragging === 'top') {
                const newTop = Math.min(Math.max(mouseY, 20), 200);
                setMargins(prev => ({ ...prev, top: newTop }));
            }
            if (isDragging === 'bottom') {
                const newBottom = Math.min(Math.max(paperRect.height - mouseY, 20), 200);
                setMargins(prev => ({ ...prev, bottom: newBottom }));
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    if (!editable) {
        return (
            <div
                className="prose max-w-none p-4 border rounded-md bg-gray-50 min-h-[300px]"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    return (
        <div className="flex flex-col border border-gray-300 rounded-md bg-white h-full overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shrink-0">

                {/* Justify Group */}
                <div className="flex gap-0.5 border-r pr-2 mr-2 border-gray-300">
                    <ToolbarBtn icon={<AlignLeft className="w-4 h-4" />} onClick={() => execCmd('justifyLeft')} title="Alinhar à Esquerda" />
                    <ToolbarBtn icon={<AlignCenter className="w-4 h-4" />} onClick={() => execCmd('justifyCenter')} title="Centralizar" />
                    <ToolbarBtn icon={<AlignRight className="w-4 h-4" />} onClick={() => execCmd('justifyRight')} title="Alinhar à Direita" />
                    <ToolbarBtn icon={<AlignJustify className="w-4 h-4" />} onClick={() => execCmd('justifyFull')} title="Justificar" />
                </div>

                {/* Style Group */}
                <div className="flex gap-0.5 border-r pr-2 mr-2 border-gray-300">
                    <ToolbarBtn icon={<Bold className="w-4 h-4" />} onClick={() => execCmd('bold')} title="Negrito" />
                    <ToolbarBtn icon={<Italic className="w-4 h-4" />} onClick={() => execCmd('italic')} title="Itálico" />
                    <ToolbarBtn icon={<Strikethrough className="w-4 h-4" />} onClick={() => execCmd('strikeThrough')} title="Tachado" />
                    <ToolbarBtn icon={<Underline className="w-4 h-4" />} onClick={() => execCmd('underline')} title="Sublinhado" />
                </div>

                {/* Insert Group */}
                <div className="flex gap-0.5 border-r pr-2 mr-2 border-gray-300">
                    <ToolbarBtn icon={<LinkIcon className="w-4 h-4" />} onClick={handleLink} title="Inserir Link" />
                    <ToolbarBtn icon={<ImageIcon className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()} title="Inserir Imagem" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <ToolbarBtn icon={<TableIcon className="w-4 h-4" />} onClick={handleTable} title="Inserir Tabela" />
                </div>

                {/* Colors & Fonts */}
                <div className="flex items-center gap-2 border-r pr-2 mr-2 border-gray-300">
                    <div className="flex items-center gap-1 group relative cursor-pointer" title="Cor da Fonte">
                        <Type className="w-4 h-4 text-gray-700" />
                        <input
                            type="color"
                            value={foreColor}
                            onChange={(e) => applyColor('foreColor', e.target.value)}
                            className="w-5 h-5 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center gap-1 group relative cursor-pointer" title="Cor de Fundo">
                        <Palette className="w-4 h-4 text-gray-700" />
                        <input
                            type="color"
                            value={backColor}
                            onChange={(e) => applyColor('backColor', e.target.value)}
                            className="w-5 h-5 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                    </div>

                    <select
                        className="h-7 border border-gray-300 rounded text-xs px-1 bg-white"
                        value={fontSize}
                        onChange={(e) => {
                            setFontSize(e.target.value);
                            execCmd('fontSize', e.target.value);
                        }}
                    >
                        <option value="1">10 pt</option>
                        <option value="2">12 pt</option>
                        <option value="3">14 pt</option>
                        <option value="4">16 pt</option>
                        <option value="5">18 pt</option>
                        <option value="6">24 pt</option>
                        <option value="7">36 pt</option>
                    </select>
                </div>

                {/* Margins Toggle */}
                <div className="flex gap-0.5">
                    <Button
                        type="button"
                        variant={showMargins ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 px-2 text-xs gap-1"
                        onClick={() => setShowMargins(!showMargins)}
                        title="Mostrar/Ocultar Margens"
                    >
                        {showMargins ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
                        Margens
                    </Button>
                </div>
            </div>

            {/* Editable Area Container with Guides */}
            <div className="flex-1 bg-slate-200 p-8 overflow-auto relative flex justify-center" ref={containerRef}>

                {/* Paper Simulation */}
                <div
                    className="bg-white shadow-lg relative transition-all duration-75 ease-linear"
                    style={{
                        width: '210mm', // A4 width
                        minHeight: '297mm', // A4 height
                        paddingTop: `${margins.top}px`,
                        paddingRight: `${margins.right}px`,
                        paddingBottom: `${margins.bottom}px`,
                        paddingLeft: `${margins.left}px`,
                        position: 'relative'
                    }}
                >
                    {/* Content */}
                    <div
                        ref={editorRef}
                        className="w-full h-full outline-none prose max-w-none text-slate-900"
                        contentEditable={editable}
                        onInput={handleInput}
                        suppressContentEditableWarning={true}
                        data-placeholder={placeholder}
                        style={{ minHeight: '100px' }}
                    />

                    {/* --- Margin Guides (Overlay) --- */}
                    {showMargins && (
                        <>
                            {/* Left Guide Line */}
                            <div
                                className="absolute top-0 bottom-0 border-l border-dashed border-blue-400 cursor-col-resize hover:border-blue-600 hover:border-solid w-2 z-10 group -ml-1"
                                style={{ left: margins.left }}
                                onMouseDown={(e) => handleMouseDown(e, 'left')}
                            >
                                <div className="absolute top-1/2 -left-8 bg-blue-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    {margins.left}px
                                </div>
                            </div>
                            {/* Left Area Mask */}
                            <div className="absolute top-0 bottom-0 left-0 bg-gray-300/30 pointer-events-none" style={{ width: margins.left }}></div>

                            {/* Right Guide Line */}
                            <div
                                className="absolute top-0 bottom-0 border-r border-dashed border-blue-400 cursor-col-resize hover:border-blue-600 hover:border-solid w-2 z-10 group -mr-1"
                                style={{ right: margins.right }}
                                onMouseDown={(e) => handleMouseDown(e, 'right')}
                            >
                                <div className="absolute top-1/2 -right-8 bg-blue-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    {margins.right}px
                                </div>
                            </div>
                            {/* Right Area Mask */}
                            <div className="absolute top-0 bottom-0 right-0 bg-gray-300/30 pointer-events-none" style={{ width: margins.right }}></div>

                            {/* Top Guide Line */}
                            <div
                                className="absolute left-0 right-0 border-t border-dashed border-blue-400 cursor-row-resize hover:border-blue-600 hover:border-solid h-2 z-10 group -mt-1"
                                style={{ top: margins.top }}
                                onMouseDown={(e) => handleMouseDown(e, 'top')}
                            >
                                <div className="absolute left-1/2 -top-5 bg-blue-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    {margins.top}px
                                </div>
                            </div>
                            {/* Top Area Mask */}
                            <div className="absolute top-0 left-0 right-0 bg-gray-300/30 pointer-events-none" style={{ height: margins.top }}></div>

                            {/* Bottom Guide Line */}
                            <div
                                className="absolute left-0 right-0 border-b border-dashed border-blue-400 cursor-row-resize hover:border-blue-600 hover:border-solid h-2 z-10 group -mb-1"
                                style={{ bottom: margins.bottom }}
                                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                            >
                                <div className="absolute left-1/2 -bottom-5 bg-blue-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    {margins.bottom}px
                                </div>
                            </div>
                            {/* Bottom Area Mask */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-300/30 pointer-events-none" style={{ height: margins.bottom }}></div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

LegacyEditor.displayName = 'LegacyEditor';

// Helper component for buttons
const ToolbarBtn = ({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title?: string }) => (
    <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-7 h-7 p-0 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
        onClick={onClick}
        title={title}
    >
        {icon}
    </Button>
);
