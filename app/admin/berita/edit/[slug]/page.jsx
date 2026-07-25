'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { getBeritaBySlug, updateBerita, getKategori, uploadImage } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditBeritaPage() {
    const router = useRouter();
    const { slug } = useParams();
    const token = Cookies.get('admin_token');

    const [kategoris, setKategoris] = useState([]);
    const [title, setTitle] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('draft');
    const [content, setContent] = useState('');
    
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [error, setError] = useState('');

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setUploadingThumbnail(true);
        try {
            const res = await uploadImage(token, file);
            if (res.status === 'success' && res.url) {
                setThumbnail(res.url);
            } else {
                setError(res.message || 'Gagal mengunggah gambar.');
            }
        } catch (err) {
            setError('Kesalahan koneksi ke server saat mengunggah gambar.');
        } finally {
            setUploadingThumbnail(false);
        }
    };

    // Auth check
    useEffect(() => {
        if (!token) {
            router.push('/admin/login');
        }
    }, [token, router]);

    // Load category list and load post data
    useEffect(() => {
        const loadInitialData = async () => {
            if (!slug || !token) return;
            setLoadingData(true);
            try {
                const [catsRes, postRes] = await Promise.all([
                    getKategori(),
                    getBeritaBySlug(slug)
                ]);
                
                setKategoris(catsRes.data || []);
                
                const post = postRes?.data;
                if (!post) {
                    alert('Berita tidak ditemukan.');
                    router.push('/admin');
                    return;
                }

                setTitle(post.title || '');
                setThumbnail(post.thumbnail || '');
                setCategory(post.category || '');
                setStatus(post.status || 'draft');
                setContent(post.content || '');
            } catch (err) {
                console.error(err);
                setError('Gagal memuat data dari server.');
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, [slug, token, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!category) {
            setError('Silakan pilih kategori terlebih dahulu.');
            return;
        }

        if (!content.trim() || content === '<p></p>') {
            setError('Konten berita tidak boleh kosong.');
            return;
        }

        setLoading(true);
        try {
            const data = { title, content, thumbnail, category, status };
            const res = await updateBerita(token, slug, data);
            if (res.status === 'success') {
                router.push('/admin');
            } else {
                setError(res.message || 'Gagal memperbarui berita.');
            }
        } catch (err) {
            setError('Kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <main className="flex-grow p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 border-b border-[#2a2a3a] pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        <span className="text-[#e63946]">📝</span> Edit Berita
                    </h1>
                    <p className="text-sm text-[#8888aa] mt-1">Ubah dan perbarui isi artikel berita.</p>
                </div>
                <Link href="/admin" className="btn btn-secondary btn-sm rounded-lg">
                    ← Kembali
                </Link>
            </div>

            {loadingData ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="spinner"></div>
                    <p className="mt-4 text-[#8888aa] text-sm">Memuat artikel berita...</p>
                </div>
            ) : (
                    <>
                        {error && (
                            <div className="alert alert-error mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Title & Rich Text Editor */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="form-group">
                                    <label className="form-label text-xs">Judul Berita</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masukkan judul berita yang menarik..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="form-input text-lg font-bold py-3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label text-xs">Konten Berita</label>
                                    <RichTextEditor
                                        value={content}
                                        onChange={(val) => setContent(val)}
                                    />
                                </div>
                            </div>

                            {/* Right Column: Settings & Meta data */}
                            <div className="space-y-6">
                                <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5 space-y-5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#2a2a3a]">
                                        ⚙️ Pengaturan Publikasi
                                    </h3>

                                    {/* Category Select */}
                                    <div className="form-group">
                                        <label className="form-label text-xs">Kategori Berita</label>
                                        {kategoris.length === 0 ? (
                                            <p className="text-xs text-[#8888aa]">Silakan buat kategori di dashboard terlebih dahulu.</p>
                                        ) : (
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="form-select text-sm"
                                            >
                                                {kategoris.map((k) => (
                                                    <option key={k._id} value={k.name}>
                                                        {k.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Thumbnail File Input */}
                                    <div className="form-group">
                                        <label className="form-label text-xs">Thumbnail / Cover Foto</label>
                                        <div className="mt-1 flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-[#e63946] border-[#2a2a3a] bg-[#0a0a0f] transition-all">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    {uploadingThumbnail ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-5 h-5 border-2 border-[#2a2a3a] border-t-[#e63946] rounded-full animate-spin"></div>
                                                            <p className="text-xs text-[#8888aa]">Mengunggah...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg className="w-8 h-8 mb-2 text-[#555570]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                            </svg>
                                                            <p className="text-xs text-[#8888aa]"><span className="font-semibold text-white">Klik untuk upload</span> gambar</p>
                                                            <p className="text-[10px] text-[#555570]">PNG, JPG atau WEBP (Maks 10MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleThumbnailUpload} 
                                                    className="hidden" 
                                                    disabled={uploadingThumbnail}
                                                />
                                            </label>
                                        </div>
                                        {thumbnail && (
                                            <div className="mt-3 aspect-[16/10] rounded-lg overflow-hidden border border-[#2a2a3a] relative group">
                                                <img
                                                    src={thumbnail}
                                                    alt="Preview Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setThumbnail('')}
                                                    className="absolute top-2 right-2 bg-black/60 hover:bg-[#e74c3c] text-white p-1.5 rounded-full transition-colors text-xs font-bold border-none cursor-pointer"
                                                    title="Hapus gambar"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="form-group">
                                        <label className="form-label text-xs">Status Penulisan</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="form-select text-sm"
                                        >
                                            <option value="draft">Draft (Simpan sebagai draf)</option>
                                            <option value="published">Published (Langsung terbitkan)</option>
                                        </select>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full justify-center py-3 rounded-lg text-sm"
                                    >
                                        {loading ? 'Menyimpan Perubahan...' : 'Perbarui Berita'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}
        </main>
    );
}
