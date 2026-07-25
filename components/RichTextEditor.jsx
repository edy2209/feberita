'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useState } from 'react';

// ============================================================
// Custom Extension: PageBreak
// Tampil sebagai garis merah bergaris putus di editor,
// disimpan sebagai <!--nextpage--> di database.
// ============================================================
const PageBreak = Node.create({
    name: 'pageBreak',
    group: 'block',
    atom: true,
    draggable: true,

    parseHTML() {
        return [{ tag: 'div[data-page-break]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-page-break': '',
                class: 'page-break-node',
                contenteditable: 'false',
            }),
        ];
    },

    addCommands() {
        return {
            insertPageBreak:
                () =>
                ({ commands }) => {
                    return commands.insertContent({ type: this.name });
                },
        };
    },
});

// ============================================================
// Helpers: konversi antara format editor & format simpan
// ============================================================

/** Sebelum masuk editor: <!--nextpage--> → <div data-page-break> */
function prepareContentForEditor(html) {
    return (html || '').replace(/<!--nextpage-->/g, '<div data-page-break=""></div>');
}

/** Sebelum disimpan: <div data-page-break> → <!--nextpage--> */
function prepareHtmlForSave(html) {
    return html.replace(/<div\s[^>]*data-page-break[^>]*><\/div>/gi, '<!--nextpage-->');
}

// ============================================================
// Komponen ToolbarButton
// ============================================================
const ToolbarButton = ({ onClick, active, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={`px-2 py-1.5 rounded text-sm font-medium transition-colors ${
            active
                ? 'bg-[#e63946] text-white'
                : 'text-[#8888aa] hover:bg-[#2a2a3a] hover:text-white'
        }`}
    >
        {children}
    </button>
);

// ============================================================
// Komponen Utama RichTextEditor
// ============================================================
export default function RichTextEditor({ value, onChange }) {
    const [imageUrl, setImageUrl] = useState('');
    const [showImgModal, setShowImgModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: true, allowBase64: false }),
            Link.configure({ openOnClick: false, autolink: false }),
            Placeholder.configure({ placeholder: 'Tulis isi berita di sini...' }),
            TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            PageBreak,
        ],
        // Pre-process: konversi <!--nextpage--> agar TipTap bisa membacanya
        content: prepareContentForEditor(value),
        onUpdate: ({ editor }) => {
            // Post-process: konversi kembali sebelum disimpan
            const rawHtml = editor.getHTML();
            onChange(prepareHtmlForSave(rawHtml));
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content outline-none min-h-[400px] p-4 text-[#f0f0f5] leading-relaxed',
            },
        },
    });

    const insertImage = () => {
        if (imageUrl.trim()) {
            editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
            setImageUrl('');
            setShowImgModal(false);
        }
    };

    const insertLink = () => {
        if (linkUrl.trim()) {
            editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
            setLinkUrl('');
            setShowLinkModal(false);
        }
    };

    if (!editor) return null;

    return (
        <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl overflow-hidden tiptap-editor">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-3 border-b border-[#2a2a3a] bg-[#111118]">
                {/* Text format */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></ToolbarButton>

                <div className="w-px h-7 bg-[#2a2a3a] mx-1 self-center" />

                {/* Headings */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

                <div className="w-px h-7 bg-[#2a2a3a] mx-1 self-center" />

                {/* Lists */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">• List</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">1. List</ToolbarButton>

                <div className="w-px h-7 bg-[#2a2a3a] mx-1 self-center" />

                {/* Blockquote & HR */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">" Quote</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Garis Pemisah">— HR</ToolbarButton>

                <div className="w-px h-7 bg-[#2a2a3a] mx-1 self-center" />

                {/* Text Alignment */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Rata Kiri">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Rata Tengah">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Rata Kanan">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </ToolbarButton>

                <div className="w-px h-7 bg-[#2a2a3a] mx-1 self-center" />

                {/* Image via URL */}
                <ToolbarButton onClick={() => setShowImgModal(true)} active={false} title="Sisipkan Foto via URL">
                    🖼 Foto
                </ToolbarButton>

                {/* Link */}
                <ToolbarButton onClick={() => setShowLinkModal(true)} active={editor.isActive('link')} title="Sisipkan Link">
                    🔗 Link
                </ToolbarButton>

                {/* Page Break — sekarang menggunakan custom extension */}
                <button
                    type="button"
                    title="Tambah pemisah halaman (Pagination)"
                    onClick={() => editor.chain().focus().insertPageBreak().run()}
                    className="px-2 py-1.5 rounded text-xs font-medium text-[#e63946] border border-[rgba(230,57,70,0.3)] hover:bg-[rgba(230,57,70,0.1)] transition-colors"
                >
                    + Halaman Baru
                </button>

                <div className="ml-auto flex gap-1">
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</ToolbarButton>
                </div>
            </div>

            {/* Editor content */}
            <EditorContent editor={editor} />

            {/* Image Modal */}
            {showImgModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowImgModal(false)}>
                    <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-1">Sisipkan Foto ke Konten</h3>
                        <p className="text-xs text-[#8888aa] mb-4">Masukkan URL/link gambar dari internet (Unsplash, imgbb, dll)</p>
                        <input
                            type="url"
                            placeholder="https://example.com/foto.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                            className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946] mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowImgModal(false)} className="px-4 py-2 rounded-lg text-sm text-[#8888aa] hover:bg-[#2a2a3a] transition-colors">Batal</button>
                            <button onClick={insertImage} className="px-4 py-2 rounded-lg text-sm bg-[#e63946] text-white hover:bg-[#c1121f] transition-colors">Sisipkan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowLinkModal(false)}>
                    <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-4">Masukkan URL Link</h3>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                            className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946] mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 rounded-lg text-sm text-[#8888aa] hover:bg-[#2a2a3a] transition-colors">Batal</button>
                            <button onClick={insertLink} className="px-4 py-2 rounded-lg text-sm bg-[#e63946] text-white hover:bg-[#c1121f] transition-colors">Sisipkan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
