'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getKategori, createKategori, deleteKategori } from '@/lib/api';

export default function KategoriPage() {
    const router = useRouter();
    const token = Cookies.get('admin_token');

    const [kategoris, setKategoris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        loadKategori();
    }, [token]);

    const loadKategori = async () => {
        setLoading(true);
        try {
            const res = await getKategori();
            setKategoris(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!newName.trim()) return;
        setSubmitting(true);
        try {
            const res = await createKategori(token, newName.trim());
            if (res.status === 'success') {
                setSuccess(`Kategori "${newName}" berhasil ditambahkan.`);
                setNewName('');
                loadKategori();
            } else {
                setError(res.message || 'Gagal menambah kategori.');
            }
        } catch (err) {
            setError('Kesalahan koneksi ke server.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (slug, name) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) return;
        try {
            const res = await deleteKategori(token, slug);
            if (res.status === 'success') {
                setSuccess(`Kategori "${name}" berhasil dihapus.`);
                loadKategori();
            } else {
                setError(res.message || 'Gagal menghapus kategori.');
            }
        } catch (err) {
            setError('Kesalahan koneksi ke server.');
        }
    };

    if (!token) return null;

    return (
        <main className="flex-grow p-4 md:p-8">
            {/* Page Header */}
            <div className="mb-8 border-b border-[#2a2a3a] pb-4">
                <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                    <span className="text-[#e63946]">📁</span> Kelola Kategori
                </h1>
                <p className="text-sm text-[#8888aa] mt-1">Tambah atau hapus kategori berita untuk pengelompokan artikel.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
                {/* Form Tambah Kategori */}
                <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#e63946]"></span>
                        Tambah Kategori Baru
                    </h2>

                    {error && <div className="alert alert-error mb-4">{error}</div>}
                    {success && <div className="alert alert-success mb-4">{success}</div>}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Nama Kategori</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Politik, Olahraga, Hiburan..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary w-full justify-center rounded-lg"
                        >
                            {submitting ? 'Menyimpan...' : '+ Tambah Kategori'}
                        </button>
                    </form>
                </div>

                {/* Daftar Kategori */}
                <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#e63946]"></span>
                        Daftar Kategori ({kategoris.length})
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : kategoris.length === 0 ? (
                        <div className="text-center py-12 text-[#8888aa] text-sm">
                            Belum ada kategori. Tambahkan kategori pertama Anda!
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {kategoris.map((k) => (
                                <div
                                    key={k._id}
                                    className="flex items-center justify-between bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-3 group hover:border-[#e63946] transition-all"
                                >
                                    <div>
                                        <span className="font-semibold text-white text-sm">{k.name}</span>
                                        <span className="text-[#555570] text-xs ml-3">/{k.slug}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(k.slug, k.name)}
                                        className="text-[#e74c3c] hover:bg-[rgba(231,76,60,0.15)] p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                        title="Hapus kategori"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
