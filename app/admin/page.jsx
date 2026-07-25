'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { getBeritaAdmin, publishBerita, deleteBerita } from '@/lib/api';
import Pagination from '@/components/Pagination';

export default function AdminDashboardPage() {
    const router = useRouter();
    const token = Cookies.get('admin_token');

    const [loading, setLoading] = useState(true);
    const [beritas, setBeritas] = useState([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, limit: 10, total: 0 });

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        loadData();
    }, [page, token]);

    const loadData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const newsRes = await getBeritaAdmin(token, { page, limit: 10 });
            setBeritas(newsRes.data || []);
            setMeta(newsRes.meta || { page: 1, totalPages: 1, limit: 10, total: 0 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (slug) => {
        if (!confirm('Apakah Anda yakin ingin mempublikasikan berita ini?')) return;
        try {
            const res = await publishBerita(token, slug);
            if (res.status === 'success') {
                loadData();
            } else {
                alert(res.message || 'Gagal mempublish berita.');
            }
        } catch (err) {
            alert('Kesalahan koneksi.');
        }
    };

    const handleDelete = async (slug) => {
        if (!confirm('Apakah Anda yakin ingin menghapus berita ini secara permanen?')) return;
        try {
            const res = await deleteBerita(token, slug);
            if (res.status === 'success') {
                loadData();
            } else {
                alert(res.message || 'Gagal menghapus berita.');
            }
        } catch (err) {
            alert('Kesalahan koneksi.');
        }
    };

    if (!token) return null;

    return (
        <main className="flex-grow p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 border-b border-[#2a2a3a] pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        <span className="text-[#e63946]">📰</span> Manajemen Berita
                    </h1>
                    <p className="text-sm text-[#8888aa] mt-1">Total {meta.total} artikel tersimpan di database</p>
                </div>
                <Link href="/admin/berita/buat" className="btn btn-primary rounded-lg">
                    + Tulis Berita Baru
                </Link>
            </div>

            {loading && beritas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="spinner"></div>
                    <p className="mt-4 text-[#8888aa] text-sm">Memuat data berita...</p>
                </div>
            ) : beritas.length === 0 ? (
                <div className="text-center py-24 bg-[#16161f] border border-[#2a2a3a] rounded-xl">
                    <p className="text-[#8888aa] text-sm mb-4">Belum ada berita yang ditulis.</p>
                    <Link href="/admin/berita/buat" className="btn btn-primary rounded-lg btn-sm">
                        Mulai Menulis Pertama
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#2a2a3a] bg-[#111118] text-[#8888aa] text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4">Info Berita</th>
                                        <th className="p-4">Kategori</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Dilihat</th>
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a2a3a]">
                                    {beritas.map((b) => (
                                        <tr key={b._id} className="hover:bg-[#1e1e2a] transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={b.thumbnail}
                                                        alt=""
                                                        className="w-14 h-10 object-cover rounded bg-[#0a0a0f] shrink-0"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/56x40/16161f/555570?text=RT'; }}
                                                    />
                                                    <div>
                                                        <h4 className="font-semibold text-sm text-white line-clamp-2 max-w-md leading-snug mb-0.5">
                                                            {b.title}
                                                        </h4>
                                                        <span className="text-[10px] text-[#8888aa]">
                                                            {b.author?.name || 'Redaksi'} — {new Date(b.createdAt).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="badge badge-category text-[10px]">{b.category}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`badge text-[10px] ${b.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-[#8888aa]">
                                                {b.jumlah_penonton?.toLocaleString('id-ID') || 0}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex gap-1">
                                                    {b.status === 'draft' && (
                                                        <button
                                                            onClick={() => handlePublish(b.slug)}
                                                            className="btn btn-success btn-sm rounded-lg"
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                    <Link href={`/admin/berita/edit/${b.slug}`} className="btn btn-secondary btn-sm rounded-lg">
                                                        Edit
                                                    </Link>
                                                    <button onClick={() => handleDelete(b.slug)} className="btn btn-danger btn-sm rounded-lg">
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </>
            )}
        </main>
    );
}
