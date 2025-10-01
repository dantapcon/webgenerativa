'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { FontSize } from './font-size-extension';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  Type,
  Palette
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  className = ''
}) => {
  const [currentFontSize, setCurrentFontSize] = useState('16');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color.configure({
        types: ['textStyle']
      }),
      Underline,
      BulletList.configure({
        HTMLAttributes: {
          class: 'my-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'my-ordered-list',
        },
      }),
      ListItem,
    ],
    content: value,
    immediatelyRender: false, // Fix para SSR
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Detectar el tamaño de fuente actual
      const fontSize = editor.getAttributes('textStyle').fontSize;
      if (fontSize) {
        // Extraer solo el número del tamaño (ej: "16px" -> "16")
        const size = fontSize.replace('px', '');
        setCurrentFontSize(size);
      } else {
        setCurrentFontSize('16'); // Tamaño por defecto
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[120px] p-4 border rounded-md',
      },
    },
  });

  // Efecto para sincronizar el estado cuando cambia el editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const colores = [
    '#000000', '#374151', '#6b7280', '#ef4444', '#f97316', 
    '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  const tamanos = [
    { label: 'Pequeño', class: 'text-sm' },
    { label: 'Normal', class: 'text-base' },
    { label: 'Grande', class: 'text-lg' },
    { label: 'Muy Grande', class: 'text-xl' }
  ];

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-gray-50">
        {/* Negritas */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>

        {/* Cursiva */}
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>

        {/* Subrayado */}
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 p-0"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lista con bullets */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>

        {/* Lista numerada */}
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Selector de color */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-gray-500" />
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Seleccionar color de texto"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Selector de tamaño */}
        <div className="flex items-center gap-1">
          <Type className="h-4 w-4 text-gray-500" />
          <select
            className="text-xs border rounded px-2 py-1"
            value={currentFontSize}
            onChange={(e) => {
              const fontSize = e.target.value;
              setCurrentFontSize(fontSize);
              editor.chain().focus().setFontSize(fontSize + 'px').run();
            }}
          >
            <option value="8">8pt</option>
            <option value="9">9pt</option>
            <option value="10">10pt</option>
            <option value="11">11pt</option>
            <option value="12">12pt</option>
            <option value="14">14pt</option>
            <option value="16">16pt</option>
            <option value="18">18pt</option>
            <option value="20">20pt</option>
            <option value="24">24pt</option>
            <option value="28">28pt</option>
            <option value="32">32pt</option>
            <option value="36">36pt</option>
            <option value="48">48pt</option>
            <option value="72">72pt</option>
          </select>
        </div>
      </div>

      {/* Editor de contenido */}
      <div className="min-h-[120px]">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;