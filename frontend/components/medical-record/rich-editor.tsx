'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

import {
    Bold, Italic, List, ListOrdered, Undo, Redo,
    Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
    Subscript as SubIcon, Superscript as SupIcon,
    Type, Palette, Highlighter, CheckSquare, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { forwardRef, useImperativeHandle } from 'react';

interface RichEditorProps {
    content?: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
}

export interface RichEditorRef {
    insertContent: (content: string) => void;
    getHTML: () => string;
}

const FONT_FAMILIES = [
    { name: 'Padrão', value: 'Inter, sans-serif' },
    { name: 'Serif', value: 'serif' },
    { name: 'Monospace', value: 'monospace' },
    { name: 'Cursive', value: 'cursive' },
    { name: 'Comic Sans', value: 'Comic Sans MS, Comic Sans, cursive' },
];

const COLORS = [
    '#000000', '#4B5563', '#DC2626', '#EA580C', '#D97706',
    '#65A30D', '#16A34A', '#059669', '#0891B2', '#2563EB',
    '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777'
];

const HIGHLIGHTS = [
    '#FDE047', '#86EFAC', '#93C5FD', '#FDBA74', '#F472B6', '#E5E7EB'
];

export const RichEditor = forwardRef<RichEditorRef, RichEditorProps>(({ content = '', onChange, placeholder = 'Digite aqui...', editable = true }, ref) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
            Subscript,
            Superscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontFamily,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] max-w-none',
            },
        },
    });

    useImperativeHandle(ref, () => ({
        insertContent: (text: string) => {
            if (editor) {
                editor.chain().focus().insertContent(text).run();
            }
        },
        getHTML: () => {
            return editor ? editor.getHTML() : '';
        }
    }));

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col h-full">
            {editable && (
                <div className="border-b border-gray-200 bg-gray-50 p-2 flex gap-1 flex-wrap items-center sticky top-0 z-10">

                    {/* Typography */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 px-2">
                                <Type className="w-4 h-4" />
                                <ChevronDown className="w-3 h-3 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                            {FONT_FAMILIES.map((font) => (
                                <DropdownMenuItem
                                    key={font.value}
                                    onClick={() => editor.chain().focus().setFontFamily(font.value).run()}
                                    className={editor.isActive('textStyle', { fontFamily: font.value }) ? 'bg-purple-50 text-purple-700' : ''}
                                    style={{ fontFamily: font.value }}
                                >
                                    {font.name}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => editor.chain().focus().unsetFontFamily().run()}>
                                Padrão
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Negrito"
                    >
                        <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Itálico"
                    >
                        <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={!editor.can().chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Sublinhado"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Colors & Highlights */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="px-2" title="Cor do Texto">
                                <Palette className="w-4 h-4" style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="flex flex-wrap gap-1 p-2 w-48 justify-center">
                            {COLORS.map((color) => (
                                <div
                                    key={color}
                                    className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border border-gray-100"
                                    style={{ backgroundColor: color }}
                                    onClick={() => editor.chain().focus().setColor(color).run()}
                                    title={color}
                                />
                            ))}
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => editor.chain().focus().unsetColor().run()}>
                                Resetar
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="px-2" title="Marca Texto">
                                <Highlighter className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="flex flex-wrap gap-1 p-2 w-32 justify-center">
                            {HIGHLIGHTS.map((color) => (
                                <div
                                    key={color}
                                    className="w-6 h-6 rounded-sm cursor-pointer hover:brightness-95 transition-all border border-gray-100"
                                    style={{ backgroundColor: color }}
                                    onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                    title={color}
                                />
                            ))}
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => editor.chain().focus().unsetHighlight().run()}>
                                Remover
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>


                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Alignment */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-gray-900' : ''}
                        title="Alinhar à Esquerda"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-gray-900' : ''}
                        title="Centralizar"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-gray-900' : ''}
                        title="Alinhar à Direita"
                    >
                        <AlignRight className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Lists & Checkbox */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Lista com Marcadores"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Lista Numerada"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={editor.isActive('taskList') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Lista de Tarefas (Checkbox)"
                    >
                        <CheckSquare className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Scripts */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        className={editor.isActive('subscript') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Subscrito"
                    >
                        <SubIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        className={editor.isActive('superscript') ? 'bg-gray-200 text-gray-900' : ''}
                        title="Sobrescrito"
                    >
                        <SupIcon className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Undo/Redo */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        title="Desfazer"
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        title="Refazer"
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto cursor-text p-4" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} className="h-full" />
            </div>
            {/* Custom styles for checkbox */}
            <style jsx global>{`
                ul[data-type="taskList"] {
                    list-style: none;
                    padding: 0;
                }
                ul[data-type="taskList"] li {
                    display: flex;
                    align-items: center;
                }
                ul[data-type="taskList"] li > label {
                    flex: 0 0 auto;
                    margin-right: 0.5rem;
                    user-select: none;
                }
                ul[data-type="taskList"] li > div {
                    flex: 1 1 auto;
                }
            `}</style>
        </div>
    );
});

RichEditor.displayName = 'RichEditor';
