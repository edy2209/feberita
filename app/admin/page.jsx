'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { getBeritaAdmin, publishBerita, deleteBerita } from '@/lib/api';
import Pagination from '@/components/Pagination';

const STATUS_TABS = [
    { label: 'Semua', value: '' },
    { label: 'Diterbitkan', value: 'published' },
    { label: 'Draf', value: 'draft' },
];

export default function AdminDashboardPage() {
    const router = useRouter();
    const token = Cookies.get('admin_token');

    const [loading, setLoading] = useState(true);
    const [beritas, setBeritas] = useState([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, limit: 10, total: 0 });
    const [activeTab, setActiveTab] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        loadData();
    }, [page, token, activeTab, searchQuery]);

    const loadData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const newsRes = await getBeritaAdmin(token, {
                page,
                limit: 10,
                status: activeTab,
                search: searchQuery,
            });
            setBeritas(newsRes.data || []);
            setMeta(newsRes.meta || { page: 1, totalPages: 1, limit: 10, total: 0 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tabValue) => {
        setActiveTab(tabValue);
        setPage(1);
    };

    // Debounce pencarian agar tidak spam request tiap ketukan
    const handleSearchInput = (val) => {
        setSearchInput(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchQuery(val);
            setPage(1);
        }, 500);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setPage(1);
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
        <main className="flex-grow p-6 md:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[#2a2a3a] pb-4 gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        <span className="text-[#e63946]">📰</span> Manajemen Berita
                    </h1>
                    <p className="text-sm text-[#8888aa] mt-1">
                        {searchQuery
                            ? `${meta.total} hasil pencarian untuk "${searchQuery}"`
                            : `Total ${meta.total} artikel tersimpan di database`}
                    </p>
                </div>
                <Link href="/admin/berita/buat" className="btn btn-primary rounded-lg shrink-0">
                    + Tulis Berita Baru
                </Link>
            </div>

            {/* Filter & Search Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center">
                {/* Status Filter Tabs */}
                <div className="flex gap-1 bg-[#111118] p-1 rounded-xl border border-[#2a2a3a] w-fit shrink-0">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
                                activeTab === tab.value
                                    ? 'bg-[#e63946] text-white shadow-md'
                                    : 'text-[#8888aa] bg-transparent hover:text-white hover:bg-[#1e1e2a]'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.value && meta.total > 0 && (
                                <span className="ml-1.5 bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                    {meta.total}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search box */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555570]"
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        placeholder="Cari judul berita..."
                        className="w-full bg-[#16161f] border border-[#2a2a3a] rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946] focus:shadow-[0_0_0_3px_rgba(230,57,70,0.1)] transition-all"
                    />
                    {searchInput && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555570] hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading && beritas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="spinner"></div>
                    <p className="mt-4 text-[#8888aa] text-sm">Memuat data berita...</p>
                </div>
            ) : beritas.length === 0 ? (
                <div className="text-center py-24 bg-[#16161f] border border-[#2a2a3a] rounded-xl">
                    <svg className="mx-auto mb-3 text-[#555570]" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p className="text-[#8888aa] text-sm mb-1">
                        {searchQuery
                            ? `Tidak ada berita dengan judul mengandung "${searchQuery}".`
                            : activeTab === 'draft'
                            ? 'Tidak ada berita berstatus draf.'
                            : activeTab === 'published'
                            ? 'Tidak ada berita yang telah diterbitkan.'
                            : 'Belum ada berita yang ditulis.'}
                    </p>
                    {searchQuery ? (
                        <button onClick={clearSearch} className="btn btn-secondary rounded-lg btn-sm mt-3">
                            Hapus Pencarian
                        </button>
                    ) : (
                        <Link href="/admin/berita/buat" className="btn btn-primary rounded-lg btn-sm mt-3">
                            Mulai Menulis Pertama
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* ======== MOBILE: Card List ======== */}
                    <div className="md:hidden space-y-3">
                        {beritas.map((b) => (
                            <div key={b._id} className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4">
                                {/* Baris atas: thumbnail + judul + status */}
                                <div className="flex gap-3 mb-3">
                                    <img
                                        src={b.thumbnail}
                                        alt=""
                                        className="w-16 h-12 object-cover rounded-lg shrink-0 bg-[#0a0a0f]"
                                        onError={(e) => { e.target.src = 'https://placehold.co/64x48/16161f/555570?text=RT'; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-1">{b.title}</h4>
                                        <span className="text-[10px] text-[#8888aa]">{b.author?.name || 'Redaksi'} — {new Date(b.createdAt).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>

                                {/* Baris tengah: kategori + status + views */}
                                <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-[#2a2a3a]">
                                    <div className="flex flex-wrap gap-1 flex-1">
                                        {(Array.isArray(b.categories) && b.categories.length > 0
                                            ? b.categories : b.category ? [b.category] : []
                                        ).map((cat, i) => (
                                            <span key={i} className="badge badge-category text-[9px]">{cat}</span>
                                        ))}
                                    </div>
                                    <span className={`badge text-[9px] shrink-0 ${b.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                                        {b.status === 'published' ? '✓ Diterbitkan' : '✎ Draf'}
                                    </span>
                                    <span className="text-[10px] text-[#8888aa] shrink-0">👁 {b.jumlah_penonton?.toLocaleString('id-ID') || 0}</span>
                                </div>

                                {/* Baris bawah: tombol aksi */}
                                <div className="flex gap-2 flex-wrap">
                                    {b.status === 'draft' && (
                                        <>
                                            <a
                                                href={`/berita/${b.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm rounded-lg text-[10px] font-semibold px-2.5 py-1"
                                                style={{ background: 'rgba(100,150,255,0.15)', color: '#7aadff', border: '1px solid rgba(100,150,255,0.25)' }}
                                            >
                                                👁 Preview
                                            </a>
                                            <button
                                                onClick={() => handlePublish(b.slug)}
                                                className="btn btn-success btn-sm rounded-lg"
                                            >
                                                Publish
                                            </button>
                                        </>
                                    )}
                                    <Link href={`/admin/berita/edit/${b.slug}`} className="btn btn-secondary btn-sm rounded-lg">Edit</Link>
                                    <button onClick={() => handleDelete(b.slug)} className="btn btn-danger btn-sm rounded-lg">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ======== DESKTOP: Table ======== */}
                    <div className="hidden md:block bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
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
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(b.categories) && b.categories.length > 0
                                                        ? b.categories
                                                        : b.category ? [b.category] : []
                                                    ).map((cat, i) => (
                                                        <span key={i} className="badge badge-category text-[10px]">{cat}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`badge text-[10px] ${b.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                                                    {b.status === 'published' ? '✓ Diterbitkan' : '✎ Draf'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-[#8888aa]">
                                                {b.jumlah_penonton?.toLocaleString('id-ID') || 0}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex gap-1 flex-wrap justify-end">
                                                    {b.status === 'draft' && (
                                                        <>
                                                            <a
                                                                href={`/berita/${b.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm rounded-lg text-[10px] font-semibold px-2.5 py-1"
                                                                style={{ background: 'rgba(100,150,255,0.15)', color: '#7aadff', border: '1px solid rgba(100,150,255,0.25)' }}
                                                            >
                                                                👁 Preview
                                                            </a>
                                                            <button
                                                                onClick={() => handlePublish(b.slug)}
                                                                className="btn btn-success btn-sm rounded-lg"
                                                            >
                                                                Publish
                                                            </button>
                                                        </>
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

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <Pagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            onPageChange={(p) => setPage(p)}
                        />
                    )}
                </>
            )}
        </main>
    );
}
