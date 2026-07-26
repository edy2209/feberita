'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useState } from 'react';
import { uploadImage } from '@/lib/api';

// ============================================================
// Helper: Convert Base64 string to a File object
// ============================================================
function base64ToFile(base64Str, filename) {
    const arr = base64Str.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

// ============================================================
// Helper: Scan and upload base64 images inside editor
// ============================================================
const scanAndUploadBase64 = (editor, token) => {
    if (!token || !editor) return;
    
    let base64Nodes = [];
    editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src && node.attrs.src.startsWith('data:image/')) {
            base64Nodes.push({ node, pos, src: node.attrs.src });
        }
    });

    base64Nodes.forEach(({ node, pos, src }) => {
        try {
            if (!window.pendingUploads) window.pendingUploads = new Set();
            if (window.pendingUploads.has(src)) return;
            window.pendingUploads.add(src);

            const ext = src.split(';')[0].split('/')[1] || 'png';
            const file = base64ToFile(src, `content-image-${Date.now()}.${ext}`);
            
            uploadImage(token, file).then(res => {
                window.pendingUploads.delete(src);
                if (res.status === 'success' && res.url) {
                    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        src: res.url
                    });
                    editor.view.dispatch(tr);
                } else {
                    console.error("Gagal mengunggah base64:", res.message);
                }
            }).catch(err => {
                console.error("Error mengunggah base64:", err);
                window.pendingUploads.delete(src);
            });
        } catch (e) {
            console.error("Gagal memproses base64 image:", e);
        }
    });
};

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
export default function RichTextEditor({ value, onChange, token }) {
    const [imageUrl, setImageUrl] = useState('');
    const [showImgModal, setShowImgModal] = useState(false);
    const [uploadingLocal, setUploadingLocal] = useState(false);
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
        content: prepareContentForEditor(value),
        onUpdate: ({ editor }) => {
            // Scan dan upload base64 otomatis jika terdeteksi di dokumen
            scanAndUploadBase64(editor, token);

            const rawHtml = editor.getHTML();
            onChange(prepareHtmlForSave(rawHtml));
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content outline-none min-h-[400px] p-4 text-[#f0f0f5] leading-relaxed',
            },
            handleDOMEvents: {
                paste(view, event) {
                    const items = (event.clipboardData || event.originalEvent.clipboardData)?.items;
                    if (!items) return false;
                    
                    let hasImage = false;
                    for (const item of items) {
                        if (item.type.indexOf('image') === 0) {
                            hasImage = true;
                            const file = item.getAsFile();
                            if (file && token) {
                                event.preventDefault();
                                uploadImage(token, file).then(res => {
                                    if (res.status === 'success' && res.url) {
                                        view.dispatch(view.state.tr.replaceSelectionWith(
                                            view.state.schema.nodes.image.create({ src: res.url })
                                        ));
                                    } else {
                                        alert(res.message || 'Gagal mengunggah gambar otomatis saat paste.');
                                    }
                                }).catch(err => {
                                    console.error(err);
                                    alert('Kesalahan koneksi saat mengunggah gambar otomatis.');
                                });
                            }
                        }
                    }
                    return hasImage;
                },
                drop(view, event) {
                    const files = event.dataTransfer?.files;
                    if (!files || files.length === 0) return false;
                    
                    let hasImage = false;
                    for (const file of files) {
                        if (file.type.indexOf('image') === 0) {
                            hasImage = true;
                            if (token) {
                                event.preventDefault();
                                uploadImage(token, file).then(res => {
                                    if (res.status === 'success' && res.url) {
                                        const { schema } = view.state;
                                        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                        if (coordinates) {
                                            view.dispatch(view.state.tr.insert(
                                                coordinates.pos,
                                                schema.nodes.image.create({ src: res.url })
                                            ));
                                        }
                                    } else {
                                        alert(res.message || 'Gagal mengunggah gambar saat drop.');
                                    }
                                }).catch(err => {
                                    console.error(err);
                                    alert('Kesalahan koneksi saat mengunggah gambar.');
                                });
                            }
                        }
                    }
                    return hasImage;
                }
            }
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

                {/* Image via URL / Direct Upload */}
                <ToolbarButton onClick={() => setShowImgModal(true)} active={false} title="Sisipkan Foto (Upload / URL)">
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
                        <h3 className="text-white font-bold mb-1 text-base">Sisipkan Foto ke Konten</h3>
                        <p className="text-xs text-[#8888aa] mb-4">Pilih upload file langsung dari komputer Anda atau masukkan link URL.</p>
                        
                        {/* Pilihan 1: Upload dari Komputer */}
                        <div className="mb-4 mt-2">
                            <label className="text-[10px] font-bold text-[#8888aa] tracking-wider block mb-1.5 uppercase">Pilihan 1: Upload dari Komputer</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    if (!token) {
                                        alert('Token tidak valid. Silakan login kembali.');
                                        return;
                                    }
                                    setUploadingLocal(true);
                                    try {
                                        const res = await uploadImage(token, file);
                                        if (res.status === 'success' && res.url) {
                                            setImageUrl(res.url);
                                        } else {
                                            alert(res.message || 'Gagal mengunggah foto.');
                                        }
                                    } catch (err) {
                                        alert('Kesalahan koneksi saat mengunggah foto.');
                                    } finally {
                                        setUploadingLocal(false);
                                    }
                                }}
                                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-2 text-xs text-[#8888aa] focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2a2a3a] file:text-white hover:file:bg-[#3d3d52]"
                                disabled={uploadingLocal}
                            />
                            {uploadingLocal && (
                                <p className="text-[10px] text-[#e63946] mt-1.5 animate-pulse">⏳ Mengunggah foto ke server...</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-grow h-px bg-[#2a2a3a]"></div>
                            <span className="text-[9px] text-[#555570] font-black uppercase">Atau</span>
                            <div className="flex-grow h-px bg-[#2a2a3a]"></div>
                        </div>

                        {/* Pilihan 2: URL Internet */}
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-[#8888aa] tracking-wider block mb-1.5 uppercase">Pilihan 2: Masukkan URL Gambar</label>
                            <input
                                type="url"
                                placeholder="https://example.com/foto.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && insertImage()}
                                className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946]"
                                disabled={uploadingLocal}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 justify-end mt-6">
                            <button onClick={() => setShowImgModal(false)} className="px-4 py-2 rounded-lg text-sm text-[#8888aa] hover:bg-[#2a2a3a] transition-colors" disabled={uploadingLocal}>Batal</button>
                            <button onClick={insertImage} className="px-4 py-2 rounded-lg text-sm bg-[#e63946] text-white hover:bg-[#c1121f] transition-colors" disabled={uploadingLocal || !imageUrl}>Sisipkan</button>
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
                            className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946]"
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
