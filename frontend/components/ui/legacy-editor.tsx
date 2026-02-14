'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Indent, Outdent, Link as LinkIcon, Image as ImageIcon,
    Undo, Redo, Table as TableIcon, Type, Palette,
    Maximize, Minimize, ChevronDown, FileText, Pill, Syringe, ListOrdered, LayoutTemplate,
    Move, Square, Layers, Trash2, GripVertical, PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

interface LegacyEditorProps {
    content?: string;
    placeholder?: string;
    onChange?: (content: string) => void;
    editable?: boolean;
}

export interface LegacyEditorRef {
    insertContent: (content: string) => void;
    getHTML: () => string;
    setContent: (content: string) => void;
}

export const LegacyEditor = forwardRef<LegacyEditorRef, LegacyEditorProps>(({ content = '', placeholder, onChange, editable = true }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const paperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editor State
    const [foreColor, setForeColor] = useState('#000000');
    const [backColor, setBackColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState('3');

    // Outer Margin State (blue - page margins)
    const [margins, setMargins] = useState({ top: 96, right: 96, bottom: 96, left: 96 });
    const [showMargins, setShowMargins] = useState(true);
    const [isDragging, setIsDragging] = useState<null | 'top' | 'right' | 'bottom' | 'left'>(null);

    // Inner Margin State (green - text area margins)
    const [innerMargins, setInnerMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
    const [showInnerMargins, setShowInnerMargins] = useState(false);
    const [isDraggingInner, setIsDraggingInner] = useState<null | 'top' | 'right' | 'bottom' | 'left'>(null);

    // Text Boxes State
    interface TextBox {
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        content: string;
    }
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
    const [isDrawingTextBox, setIsDrawingTextBox] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
    const [isDraggingTextBox, setIsDraggingTextBox] = useState<string | null>(null);
    const [textBoxDragOffset, setTextBoxDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Vertical Alignment Lines (Tab Stops) State
    interface AlignmentLine {
        id: string;
        x: number; // Position from left of content area
    }
    const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([]);
    const [isCreatingAlignmentLine, setIsCreatingAlignmentLine] = useState(false);
    const [alignmentLinePreviewX, setAlignmentLinePreviewX] = useState<number | null>(null);
    const [hoveredAlignmentLine, setHoveredAlignmentLine] = useState<string | null>(null);

    // Layout Toolbar State
    const [showLayoutToolbar, setShowLayoutToolbar] = useState(false);


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
        },
        setContent: (html: string) => {
            if (editorRef.current) {
                editorRef.current.innerHTML = html;
                handleInput();
            }
        }
    }));

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!editorRef.current?.contains(document.activeElement)) return;

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (!modifier) return;

            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    execCmd('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    execCmd('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    execCmd('underline');
                    break;
                case 'x':
                    if (e.shiftKey) {
                        e.preventDefault();
                        execCmd('strikeThrough');
                    }
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        execCmd('redo');
                    } else {
                        execCmd('undo');
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    execCmd('redo');
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

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

    // --- Inner Margin Dragging Logic ---
    const handleInnerMouseDown = (e: React.MouseEvent, side: 'top' | 'right' | 'bottom' | 'left') => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingInner(side);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingInner || !paperRef.current) return;

            const paperRect = paperRef.current.getBoundingClientRect();
            const mouseX = e.clientX - paperRect.left - margins.left;
            const mouseY = e.clientY - paperRect.top - margins.top;

            const contentWidth = paperRect.width - margins.left - margins.right;
            const contentHeight = paperRect.height - margins.top - margins.bottom;

            // Limits (min 0px, max half of content area)
            if (isDraggingInner === 'left') {
                const newLeft = Math.min(Math.max(mouseX, 0), contentWidth / 2);
                setInnerMargins(prev => ({ ...prev, left: newLeft }));
            }
            if (isDraggingInner === 'right') {
                const newRight = Math.min(Math.max(contentWidth - mouseX, 0), contentWidth / 2);
                setInnerMargins(prev => ({ ...prev, right: newRight }));
            }
            if (isDraggingInner === 'top') {
                const newTop = Math.min(Math.max(mouseY, 0), contentHeight / 2);
                setInnerMargins(prev => ({ ...prev, top: newTop }));
            }
            if (isDraggingInner === 'bottom') {
                const newBottom = Math.min(Math.max(contentHeight - mouseY, 0), contentHeight / 2);
                setInnerMargins(prev => ({ ...prev, bottom: newBottom }));
            }
        };

        const handleMouseUp = () => {
            setIsDraggingInner(null);
        };

        if (isDraggingInner) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingInner, margins]);

    // --- Text Box Drawing Logic ---
    const handlePaperMouseDown = (e: React.MouseEvent) => {
        if (!isDrawingTextBox || !paperRef.current) return;

        const paperRect = paperRef.current.getBoundingClientRect();
        const x = e.clientX - paperRect.left;
        const y = e.clientY - paperRect.top;

        // Check if clicking in margin area (not in content area)
        const inMargin = x < margins.left || x > (paperRect.width - margins.right) ||
            y < margins.top || y > (paperRect.height - margins.bottom);

        if (inMargin) {
            setDrawStart({ x, y });
            setCurrentBox({ x, y, width: 0, height: 0 });
        }
    };

    const handlePaperMouseMove = (e: React.MouseEvent) => {
        if (!drawStart || !paperRef.current) return;

        const paperRect = paperRef.current.getBoundingClientRect();
        const currentX = e.clientX - paperRect.left;
        const currentY = e.clientY - paperRect.top;

        setCurrentBox({
            x: Math.min(drawStart.x, currentX),
            y: Math.min(drawStart.y, currentY),
            width: Math.abs(currentX - drawStart.x),
            height: Math.abs(currentY - drawStart.y)
        });
    };

    const handlePaperMouseUp = () => {
        if (currentBox && currentBox.width > 30 && currentBox.height > 20) {
            const newTextBox: TextBox = {
                id: `textbox-${Date.now()}`,
                x: currentBox.x,
                y: currentBox.y,
                width: currentBox.width,
                height: currentBox.height,
                content: ''
            };
            setTextBoxes(prev => [...prev, newTextBox]);
        }
        setDrawStart(null);
        setCurrentBox(null);
        setIsDrawingTextBox(false);

        // Handle alignment line creation
        if (isCreatingAlignmentLine && alignmentLinePreviewX !== null && paperRef.current) {
            const newLine: AlignmentLine = {
                id: `align-${Date.now()}`,
                x: alignmentLinePreviewX
            };
            setAlignmentLines(prev => [...prev, newLine]);
            setIsCreatingAlignmentLine(false);
            setAlignmentLinePreviewX(null);
        }

        // Handle text box drag end
        if (isDraggingTextBox) {
            setIsDraggingTextBox(null);
        }
    };

    const deleteTextBox = (id: string) => {
        setTextBoxes(prev => prev.filter(box => box.id !== id));
        setSelectedTextBox(null);
    };

    const updateTextBoxContent = (id: string, content: string) => {
        setTextBoxes(prev => prev.map(box =>
            box.id === id ? { ...box, content } : box
        ));
    };

    // --- Text Box Dragging ---
    const handleTextBoxDragStart = (e: React.MouseEvent, boxId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const box = textBoxes.find(b => b.id === boxId);
        if (!box || !paperRef.current) return;

        const paperRect = paperRef.current.getBoundingClientRect();
        const mouseX = e.clientX - paperRect.left;
        const mouseY = e.clientY - paperRect.top;

        setIsDraggingTextBox(boxId);
        setTextBoxDragOffset({ x: mouseX - box.x, y: mouseY - box.y });
        setSelectedTextBox(boxId);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingTextBox || !paperRef.current) return;

            const paperRect = paperRef.current.getBoundingClientRect();
            const mouseX = e.clientX - paperRect.left;
            const mouseY = e.clientY - paperRect.top;

            setTextBoxes(prev => prev.map(box => {
                if (box.id === isDraggingTextBox) {
                    return {
                        ...box,
                        x: Math.max(0, mouseX - textBoxDragOffset.x),
                        y: Math.max(0, mouseY - textBoxDragOffset.y)
                    };
                }
                return box;
            }));
        };

        const handleMouseUp = () => {
            setIsDraggingTextBox(null);
        };

        if (isDraggingTextBox) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingTextBox, textBoxDragOffset]);

    // --- Alignment Lines ---
    const deleteAlignmentLine = (id: string) => {
        setAlignmentLines(prev => prev.filter(line => line.id !== id));
    };

    const handleAlignmentLineClick = (e: React.MouseEvent, lineX: number) => {
        // If Ctrl/Cmd is pressed and there's selected text, align it
        if (e.ctrlKey || e.metaKey) {
            alignSelectedTextToLine(lineX);
        }
    };

    const alignSelectedTextToLine = (lineX: number) => {
        if (!editorRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (!range || range.collapsed) return;

        // Calculate padding-left based on the alignment line position
        const paddingLeft = Math.max(0, lineX - margins.left);

        // Wrap selected content in a div with padding
        const selectedContent = range.extractContents();
        const wrapper = document.createElement('div');
        wrapper.style.paddingLeft = `${paddingLeft}px`;
        wrapper.appendChild(selectedContent);
        range.insertNode(wrapper);

        handleInput();
    };

    const handlePaperMouseMoveForAlignment = (e: React.MouseEvent) => {
        if (!isCreatingAlignmentLine || !paperRef.current) return;

        const paperRect = paperRef.current.getBoundingClientRect();
        const mouseX = e.clientX - paperRect.left;

        // Only allow lines within the content area
        if (mouseX >= margins.left && mouseX <= (paperRect.width - margins.right)) {
            setAlignmentLinePreviewX(mouseX);
        }
    };

    const handlePaperClickForAlignment = (e: React.MouseEvent) => {
        if (isCreatingAlignmentLine && alignmentLinePreviewX !== null) {
            const newLine: AlignmentLine = {
                id: `align-${Date.now()}`,
                x: alignmentLinePreviewX
            };
            setAlignmentLines(prev => [...prev, newLine]);
            setIsCreatingAlignmentLine(false);
            setAlignmentLinePreviewX(null);
        }
    };


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

                {/* Indent/Outdent Group */}
                <div className="flex gap-0.5 border-r pr-2 mr-2 border-gray-300">
                    <ToolbarBtn icon={<Outdent className="w-4 h-4" />} onClick={() => execCmd('outdent')} title="Diminuir Recuo" />
                    <ToolbarBtn icon={<Indent className="w-4 h-4" />} onClick={() => execCmd('indent')} title="Aumentar Recuo" />
                </div>

                {/* Templates Dropdown - Elegante */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-primary/30 text-primary hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 font-medium shadow-sm"
                        >
                            <LayoutTemplate className="w-4 h-4" />
                            Templates
                            <ChevronDown className="w-3 h-3 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72 p-2" align="start">
                        <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">
                            Formatos de Prescrição
                        </DropdownMenuLabel>

                        {/* Medicamentos */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                                <Pill className="w-4 h-4 text-purple-500" />
                                <span>Medicamentos</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-64">
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <p><strong>MEDICAMENTO 500mg</strong></p>
                                        <p style="padding-left: 40px;">Manipular 30 doses</p>
                                        <p style="padding-left: 40px;">Tomar 1 dose ao dia.</p>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">💊</span>
                                    <div>
                                        <p className="font-medium">Medicamento + Posologia</p>
                                        <p className="text-xs text-gray-500">Nome em negrito, posologia indentada</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <p><strong>MEDICAMENTO</strong> _____ mg/ml</p>
                                        <p style="padding-left: 40px;">Quantidade: _____ unidades</p>
                                        <p style="padding-left: 40px;">Posologia: _____</p>
                                        <p style="padding-left: 40px;">Via: _____ | Frequência: _____</p>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">📋</span>
                                    <div>
                                        <p className="font-medium">Formato Completo</p>
                                        <p className="text-xs text-gray-500">Com campos para preencher</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <p><strong>MANIPULADO</strong></p>
                                        <p style="padding-left: 40px;">Fórmula: _____</p>
                                        <p style="padding-left: 40px;">Manipular: _____ cápsulas</p>
                                        <p style="padding-left: 40px;">Tomar 1 cápsula _____</p>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">⚗️</span>
                                    <div>
                                        <p className="font-medium">Manipulados</p>
                                        <p className="text-xs text-gray-500">Para farmácia de manipulação</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Grupos (Barra Vertical) */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                                <Syringe className="w-4 h-4 text-orange-500" />
                                <span>Grupos EV / IM</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-64">
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <table style="border-collapse: collapse; margin: 10px 0;">
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">Medicamento 1</td>
                                                <td rowspan="2" style="padding: 2px 0 2px 10px; vertical-align: middle;">Fazer EV em 30 min.</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">SF 0,9% 250ml</td>
                                            </tr>
                                        </table>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">2️⃣</span>
                                    <div>
                                        <p className="font-medium">2 Componentes</p>
                                        <p className="text-xs text-gray-500">Medicamento + Diluente</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <table style="border-collapse: collapse; margin: 10px 0;">
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">Componente 1</td>
                                                <td rowspan="3" style="padding: 2px 0 2px 10px; vertical-align: middle;">Fazer EV em 30 min.</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">Componente 2</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">SF 0,9% 250ml</td>
                                            </tr>
                                        </table>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">3️⃣</span>
                                    <div>
                                        <p className="font-medium">3 Componentes</p>
                                        <p className="text-xs text-gray-500">Vitaminas + Diluente</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <table style="border-collapse: collapse; margin: 10px 0;">
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">Complexo B S/ B1</td>
                                                <td rowspan="4" style="padding: 2px 0 2px 10px; vertical-align: middle;">Fazer EV lento em 30 min.</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">Metilfolato</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">Metilcobalamina</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 2px 10px 2px 0; border-right: 2px solid #666;">SF 0,9% 250ml</td>
                                            </tr>
                                        </table>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">4️⃣</span>
                                    <div>
                                        <p className="font-medium">4 Componentes</p>
                                        <p className="text-xs text-gray-500">Vitaminas complexo completo</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Listas */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                                <ListOrdered className="w-4 h-4 text-green-500" />
                                <span>Listas Numeradas</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-64">
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <p><strong>USO ORAL</strong></p>
                                        <p>&nbsp;</p>
                                        <p>1. <strong>Medicamento</strong> _______________</p>
                                        <p style="padding-left: 20px;">Tomar 1 cp ao dia.</p>
                                        <p>&nbsp;</p>
                                        <p>2. <strong>Medicamento</strong> _______________</p>
                                        <p style="padding-left: 20px;">Tomar conforme orientação.</p>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">📝</span>
                                    <div>
                                        <p className="font-medium">Lista Uso Oral</p>
                                        <p className="text-xs text-gray-500">2 medicamentos numerados</p>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => execCmd('insertHTML', `
                                        <p><strong>USO INJETÁVEL</strong></p>
                                        <p>&nbsp;</p>
                                        <p>1. _______________</p>
                                        <p style="padding-left: 20px;">Aplicar IM _____</p>
                                        <p>&nbsp;</p>
                                        <p>2. _______________</p>
                                        <p style="padding-left: 20px;">Aplicar EV _____</p>
                                        <p>&nbsp;</p>
                                    `)}
                                    className="gap-2 cursor-pointer"
                                >
                                    <span className="text-lg">💉</span>
                                    <div>
                                        <p className="font-medium">Lista Uso Injetável</p>
                                        <p className="text-xs text-gray-500">2 medicamentos IM/EV</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        {/* Cabeçalhos */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span>Cabeçalhos de Via</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-56">
                                <DropdownMenuItem onClick={() => execCmd('insertHTML', '<p><strong>USO ORAL</strong></p><p>&nbsp;</p>')} className="cursor-pointer">
                                    💊 USO ORAL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCmd('insertHTML', '<p><strong>USO INJETÁVEL</strong></p><p>&nbsp;</p>')} className="cursor-pointer">
                                    💉 USO INJETÁVEL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCmd('insertHTML', '<p><strong>USO TÓPICO</strong></p><p>&nbsp;</p>')} className="cursor-pointer">
                                    🧴 USO TÓPICO
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCmd('insertHTML', '<p><strong>USO NASAL</strong></p><p>&nbsp;</p>')} className="cursor-pointer">
                                    👃 USO NASAL
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCmd('insertHTML', '<p><strong>USO OFTÁLMICO</strong></p><p>&nbsp;</p>')} className="cursor-pointer">
                                    👁️ USO OFTÁLMICO
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => execCmd('insertHTML', '<p><strong>USO SUBLINGUAL</strong></p><p>&nbsp;</p>')} className="cursor-pointer">
                                    👅 USO SUBLINGUAL
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        {/* Separadores */}
                        <DropdownMenuItem
                            onClick={() => execCmd('insertHTML', '<p>────────────────────────────────</p>')}
                            className="gap-2 cursor-pointer"
                        >
                            <span className="text-lg">➖</span>
                            <span>Linha Separadora</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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

                {/* Layout Dropdown */}
                <DropdownMenu open={showLayoutToolbar} onOpenChange={setShowLayoutToolbar}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant={showLayoutToolbar ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-2 text-xs gap-1"
                        >
                            <PanelLeft className="w-3 h-3" />
                            Layout
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                            📐 Ferramentas de Layout
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Page Margins (Blue) */}
                        <div className="flex items-center justify-between gap-2 px-2 py-2 rounded bg-primary/10 border border-blue-100 mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                                <span className="text-xs text-primary font-medium">Margens da Página</span>
                            </div>
                            <Button
                                type="button"
                                variant={showMargins ? "default" : "outline"}
                                size="sm"
                                className={`h-6 px-3 text-xs ${showMargins ? 'bg-primary/100 hover:bg-primary' : ''}`}
                                onClick={() => setShowMargins(!showMargins)}
                            >
                                {showMargins ? 'ON' : 'OFF'}
                            </Button>
                        </div>

                        {/* Inner Margins (Green) */}
                        <div className="flex flex-col gap-1 px-2 py-2 rounded bg-emerald-50 border border-emerald-100 mb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                                    <span className="text-xs text-emerald-700 font-medium">Margens de Texto</span>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant={showInnerMargins ? "default" : "outline"}
                                        size="sm"
                                        className={`h-6 px-3 text-xs ${showInnerMargins ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                        onClick={() => setShowInnerMargins(!showInnerMargins)}
                                    >
                                        {showInnerMargins ? 'ON' : 'OFF'}
                                    </Button>
                                    {showInnerMargins && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs text-emerald-600"
                                            onClick={() => setInnerMargins({ top: 0, right: 0, bottom: 0, left: 0 })}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DropdownMenuSeparator />

                        {/* Text Box Tool */}
                        <div className="flex flex-col gap-1 px-2 py-2 rounded bg-amber-50 border border-amber-100 mb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Square className="w-3 h-3 text-amber-600" />
                                    <span className="text-xs text-amber-700 font-medium">Caixa de Texto</span>
                                    {textBoxes.length > 0 && (
                                        <span className="text-[10px] bg-amber-200 text-amber-700 px-1.5 rounded-full">{textBoxes.length}</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant={isDrawingTextBox ? "default" : "outline"}
                                    size="sm"
                                    className={`h-6 px-3 text-xs ${isDrawingTextBox ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                                    onClick={() => {
                                        setIsDrawingTextBox(!isDrawingTextBox);
                                        setShowLayoutToolbar(false);
                                    }}
                                >
                                    {isDrawingTextBox ? '✏️ Ativo' : '+ Criar'}
                                </Button>
                            </div>
                            {isDrawingTextBox && (
                                <p className="text-[10px] text-amber-600 mt-1">
                                    💡 Clique e arraste na margem
                                </p>
                            )}
                        </div>

                        {/* Alignment Lines Tool */}
                        <div className="flex flex-col gap-1 px-2 py-2 rounded bg-primary/10 border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-0.5 h-4 bg-primary/100"></div>
                                    <span className="text-xs text-primary font-medium">Linha de Alinhamento</span>
                                    {alignmentLines.length > 0 && (
                                        <span className="text-[10px] bg-purple-200 text-primary px-1.5 rounded-full">{alignmentLines.length}</span>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant={isCreatingAlignmentLine ? "default" : "outline"}
                                        size="sm"
                                        className={`h-6 px-3 text-xs ${isCreatingAlignmentLine ? 'bg-primary/100 hover:bg-primary text-white' : ''}`}
                                        onClick={() => {
                                            setIsCreatingAlignmentLine(!isCreatingAlignmentLine);
                                            setAlignmentLinePreviewX(null);
                                            setShowLayoutToolbar(false);
                                        }}
                                    >
                                        {isCreatingAlignmentLine ? '📍 Ativo' : '+ Criar'}
                                    </Button>
                                    {alignmentLines.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-1 text-xs text-destructive hover:text-red-700"
                                            onClick={() => setAlignmentLines([])}
                                            title="Limpar todas"
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {isCreatingAlignmentLine && (
                                <p className="text-[10px] text-primary mt-1">
                                    💡 Clique na área de texto • Ctrl+Click para alinhar
                                </p>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Editable Area Container with Guides */}
            <div className="flex-1 bg-slate-300 p-2 overflow-auto relative flex justify-center" ref={containerRef}>

                {/* Paper Simulation */}
                <div
                    ref={paperRef}
                    className={`bg-white  relative transition-all duration-75 ease-linear ${isDrawingTextBox ? 'cursor-crosshair' : ''} ${isCreatingAlignmentLine ? 'cursor-col-resize' : ''}`}
                    style={{
                        width: '210mm', // A4 width
                        minHeight: '297mm', // A4 height
                        paddingTop: `${margins.top}px`,
                        paddingRight: `${margins.right}px`,
                        paddingBottom: `${margins.bottom}px`,
                        paddingLeft: `${margins.left}px`,
                        position: 'relative'
                    }}
                    onMouseDown={(e) => {
                        handlePaperMouseDown(e);
                        handlePaperClickForAlignment(e);
                    }}
                    onMouseMove={(e) => {
                        handlePaperMouseMove(e);
                        handlePaperMouseMoveForAlignment(e);
                    }}
                    onMouseUp={handlePaperMouseUp}
                >
                    {/* Content Area with Inner Margins */}
                    <div
                        ref={editorRef}
                        className="w-full h-full outline-none prose max-w-none text-foreground"
                        contentEditable={editable}
                        onInput={handleInput}
                        suppressContentEditableWarning={true}
                        data-placeholder={placeholder}
                        style={{
                            minHeight: '100px',
                            paddingTop: `${innerMargins.top}px`,
                            paddingRight: `${innerMargins.right}px`,
                            paddingBottom: `${innerMargins.bottom}px`,
                            paddingLeft: `${innerMargins.left}px`,
                        }}
                    />

                    {/* --- Outer Margin Guides (Blue) --- */}
                    {showMargins && (
                        <>
                            {/* Left Guide Line */}
                            <div
                                className="absolute top-0 bottom-0 border-l border-dashed border-blue-400 cursor-col-resize hover:border-blue-600 hover:border-solid w-2 z-10 group -ml-1"
                                style={{ left: margins.left }}
                                onMouseDown={(e) => handleMouseDown(e, 'left')}
                            >
                                <div className="absolute top-1/2 -left-8 bg-primary/100 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
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
                                <div className="absolute top-1/2 -right-8 bg-primary/100 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
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
                                <div className="absolute left-1/2 -top-5 bg-primary/100 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
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
                                <div className="absolute left-1/2 -bottom-5 bg-primary/100 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                    {margins.bottom}px
                                </div>
                            </div>
                            {/* Bottom Area Mask */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-300/30 pointer-events-none" style={{ height: margins.bottom }}></div>
                        </>
                    )}

                    {/* --- Inner Margin Guides (Green) --- */}
                    {showInnerMargins && (
                        <>
                            {/* Inner Left Guide */}
                            {innerMargins.left > 0 && (
                                <div
                                    className="absolute border-l-2 border-dashed border-emerald-400 cursor-col-resize hover:border-emerald-600 hover:border-solid w-2 z-20 group"
                                    style={{
                                        left: margins.left + innerMargins.left,
                                        top: margins.top,
                                        bottom: margins.bottom
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'left')}
                                >
                                    <div className="absolute top-1/2 -left-10 bg-emerald-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        +{innerMargins.left}px
                                    </div>
                                </div>
                            )}

                            {/* Inner Right Guide */}
                            {innerMargins.right > 0 && (
                                <div
                                    className="absolute border-r-2 border-dashed border-emerald-400 cursor-col-resize hover:border-emerald-600 hover:border-solid w-2 z-20 group"
                                    style={{
                                        right: margins.right + innerMargins.right,
                                        top: margins.top,
                                        bottom: margins.bottom
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'right')}
                                >
                                    <div className="absolute top-1/2 -right-10 bg-emerald-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        +{innerMargins.right}px
                                    </div>
                                </div>
                            )}

                            {/* Inner Top Guide */}
                            {innerMargins.top > 0 && (
                                <div
                                    className="absolute border-t-2 border-dashed border-emerald-400 cursor-row-resize hover:border-emerald-600 hover:border-solid h-2 z-20 group"
                                    style={{
                                        top: margins.top + innerMargins.top,
                                        left: margins.left,
                                        right: margins.right
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'top')}
                                >
                                    <div className="absolute left-1/2 -top-6 bg-emerald-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        +{innerMargins.top}px
                                    </div>
                                </div>
                            )}

                            {/* Inner Bottom Guide */}
                            {innerMargins.bottom > 0 && (
                                <div
                                    className="absolute border-b-2 border-dashed border-emerald-400 cursor-row-resize hover:border-emerald-600 hover:border-solid h-2 z-20 group"
                                    style={{
                                        bottom: margins.bottom + innerMargins.bottom,
                                        left: margins.left,
                                        right: margins.right
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'bottom')}
                                >
                                    <div className="absolute left-1/2 -bottom-6 bg-emerald-500 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                        +{innerMargins.bottom}px
                                    </div>
                                </div>
                            )}

                            {/* Draggable handles when inner margins are 0 */}
                            {innerMargins.left === 0 && (
                                <div
                                    className="absolute border-l-2 border-transparent hover:border-emerald-300 cursor-col-resize w-2 z-20"
                                    style={{
                                        left: margins.left,
                                        top: margins.top,
                                        bottom: margins.bottom
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'left')}
                                    title="Arraste para criar margem interna esquerda"
                                />
                            )}
                            {innerMargins.right === 0 && (
                                <div
                                    className="absolute border-r-2 border-transparent hover:border-emerald-300 cursor-col-resize w-2 z-20"
                                    style={{
                                        right: margins.right,
                                        top: margins.top,
                                        bottom: margins.bottom
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'right')}
                                    title="Arraste para criar margem interna direita"
                                />
                            )}
                            {innerMargins.top === 0 && (
                                <div
                                    className="absolute border-t-2 border-transparent hover:border-emerald-300 cursor-row-resize h-2 z-20"
                                    style={{
                                        top: margins.top,
                                        left: margins.left,
                                        right: margins.right
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'top')}
                                    title="Arraste para criar margem interna superior"
                                />
                            )}
                            {innerMargins.bottom === 0 && (
                                <div
                                    className="absolute border-b-2 border-transparent hover:border-emerald-300 cursor-row-resize h-2 z-20"
                                    style={{
                                        bottom: margins.bottom,
                                        left: margins.left,
                                        right: margins.right
                                    }}
                                    onMouseDown={(e) => handleInnerMouseDown(e, 'bottom')}
                                    title="Arraste para criar margem interna inferior"
                                />
                            )}
                        </>
                    )}

                    {/* --- Text Boxes --- */}
                    {textBoxes.map((box) => (
                        <div
                            key={box.id}
                            className={`absolute border-2 ${selectedTextBox === box.id ? 'border-amber-500 ' : 'border-amber-300'} ${isDraggingTextBox === box.id ? 'opacity-80' : ''} bg-white rounded z-30 group`}
                            style={{
                                left: box.x,
                                top: box.y,
                                width: box.width,
                                height: box.height,
                                minWidth: 50,
                                minHeight: 30
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTextBox(box.id);
                            }}
                        >
                            {/* Drag Handle Header */}
                            <div
                                className="absolute -top-6 left-0 right-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <div
                                    className="flex items-center gap-1 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-t cursor-move hover:bg-amber-600"
                                    onMouseDown={(e) => handleTextBoxDragStart(e, box.id)}
                                >
                                    <GripVertical className="w-3 h-3" />
                                    <span>Arrastar</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 bg-destructive/100 hover:bg-red-600 text-white rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTextBox(box.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                            {/* Editable Content */}
                            <div
                                className="w-full h-full p-2 outline-none text-sm overflow-auto"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateTextBoxContent(box.id, e.currentTarget.innerHTML)}
                                dangerouslySetInnerHTML={{ __html: box.content }}
                            />
                        </div>
                    ))}

                    {/* --- Alignment Lines --- */}
                    {alignmentLines.map((line) => (
                        <div
                            key={line.id}
                            className="absolute z-25 group"
                            style={{
                                left: line.x - 6,
                                top: margins.top,
                                bottom: margins.bottom,
                                width: 12
                            }}
                        >
                            {/* The actual line */}
                            <div
                                className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/100 hover:bg-primary cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    alignSelectedTextToLine(line.x);
                                }}
                                title="Click para alinhar texto selecionado"
                            />

                            {/* Delete button - appears on hover */}
                            <button
                                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-destructive/100 hover:bg-red-600 text-white text-[9px] w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAlignmentLine(line.id);
                                }}
                                title="Deletar linha"
                            >
                                ✕
                            </button>

                            {/* Position indicator */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-primary/100 text-white text-[8px] px-1 rounded whitespace-nowrap pointer-events-none">
                                {Math.round(line.x - margins.left)}px
                            </div>
                        </div>
                    ))}

                    {/* Alignment Line Preview */}
                    {isCreatingAlignmentLine && alignmentLinePreviewX !== null && (
                        <div
                            className="absolute bg-purple-400/50 pointer-events-none z-35 animate-pulse"
                            style={{
                                left: alignmentLinePreviewX,
                                top: margins.top,
                                bottom: margins.bottom,
                                width: 2
                            }}
                        >
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-primary/100 text-white text-[8px] px-1 rounded whitespace-nowrap">
                                {Math.round(alignmentLinePreviewX - margins.left)}px
                            </div>
                        </div>
                    )}

                    {/* Drawing Preview (Text Box) */}
                    {currentBox && (
                        <div
                            className="absolute border-2 border-dashed border-amber-500 bg-amber-50/50 pointer-events-none z-40"
                            style={{
                                left: currentBox.x,
                                top: currentBox.y,
                                width: currentBox.width,
                                height: currentBox.height
                            }}
                        />
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
        className="w-7 h-7 p-0 text-gray-600 hover:text-primary hover:bg-primary/10"
        onClick={onClick}
        title={title}
    >
        {icon}
    </Button>
);
