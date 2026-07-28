'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import { incrementView, getRelatedBerita } from '@/lib/api';

export default function BeritaDetailClient({ berita, populars = [], latests = [], kategoris = [], slug }) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);

    // State untuk Berita Terkait
    const [relateds, setRelateds] = useState([]);
    const [relatedMeta, setRelatedMeta] = useState({ page: 1, totalPages: 1, total: 0 });
    const [relatedPage, setRelatedPage] = useState(1);
    const [loadingRelated, setLoadingRelated] = useState(true);

    useEffect(() => {
        if (!slug) return;
        incrementView(slug).catch(err => console.error('Gagal menaikkan views:', err));
    }, [slug]);

    // Fetch berita terkait saat page berubah
    useEffect(() => {
        if (!slug) return;
        const fetchRelated = async () => {
            setLoadingRelated(true);
            try {
                const res = await getRelatedBerita(slug, relatedPage, 6);
                setRelateds(res.data || []);
                setRelatedMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
            } catch (err) {
                console.error('Gagal memuat berita terkait:', err);
            } finally {
                setLoadingRelated(false);
            }
        };
        fetchRelated();
    }, [slug, relatedPage]);

    if (!berita) return null;

    // ============================================================
    // Normalisasi konten: tangani berbagai format <!--nextpage-->
    // yang mungkin tersimpan di DB (lama vs baru)
    // ============================================================
    const normalizeContent = (raw) => {
        return (raw || '')
            .replace(/&lt;!--nextpage--&gt;/gi, '<!--nextpage-->')
            .replace(/<p>\s*<!--nextpage-->\s*<\/p>/gi, '<!--nextpage-->')
            .replace(/\s*<!--nextpage-->\s*/g, '<!--nextpage-->');
    };

    const contentPages = normalizeContent(berita.content).split('<!--nextpage-->');
    const displayContent = contentPages[currentPage - 1] || '';

    const formattedDate = new Date(berita.createdAt).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar kategoris={kategoris} />

            <main className="flex-grow max-w-[1200px] w-full mx-auto px-5 py-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#e63946] mb-6 transition-all bg-transparent border-none cursor-pointer py-2 px-3 -ml-3 rounded-lg hover:bg-[#16161f] active:bg-[#2a2a3a] select-none"
                >
                    ← Kembali
                </button>

                {/* Grid utama: artikel kiri + sidebar kanan */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left/Main Column: News Article */}
                    <article className="lg:col-span-2">
                        {/* Meta info */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            {(Array.isArray(berita.categories) && berita.categories.length > 0
                                ? berita.categories
                                : berita.category ? [berita.category] : []
                            ).map((cat, i) => (
                                <span key={i} className="bg-[#e63946] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                    {cat}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                            {berita.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-[#8888aa] pb-6 border-b border-[#2a2a3a] mb-6">
                            <span className="text-[#f0f0f5] font-semibold">{berita.author?.name || 'Redaksi'}</span>
                            <span className="text-[#555570]">•</span>
                            <span>{formattedDate}</span>
                            <span className="text-[#555570]">•</span>
                            <span className="flex items-center gap-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                {berita.jumlah_penonton?.toLocaleString('id-ID') || 0} dibaca
                            </span>
                        </div>

                        {/* Article body */}
                        <div
                            className="prose-news"
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                        />

                        {/* Content Pagination (Halaman artikel) */}
                        {contentPages.length > 1 && (
                            <div className="mt-10 pt-6 border-t border-[#2a2a3a] flex flex-col items-center">
                                <span className="text-xs text-[#8888aa] font-semibold uppercase tracking-wider mb-3">
                                    Halaman Artikel
                                </span>
                                <div className="flex gap-2">
                                    {contentPages.map((_, index) => {
                                        const pNum = index + 1;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setCurrentPage(pNum);
                                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                                }}
                                                className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all ${
                                                    currentPage === pNum
                                                        ? 'bg-[#e63946] border-[#e63946] text-white shadow-[0_0_10px_rgba(230,57,70,0.3)]'
                                                        : 'bg-[#16161f] border-[#2a2a3a] text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946]'
                                                }`}
                                            >
                                                {pNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-xs text-[#555570] mt-2">
                                    Menampilkan Halaman {currentPage} dari {contentPages.length}
                                </span>
                            </div>
                        )}
                    </article>

                    {/* Right Column: Sidebar — hanya tampil di desktop */}
                    <div className="hidden lg:flex lg:flex-col lg:space-y-10">
                        {/* Popular widget */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a3a] flex items-center gap-2">
                                🔥 Paling Populer
                            </h3>
                            {populars.length === 0 ? (
                                <p className="text-xs text-[#8888aa] py-3">Belum ada berita terpopuler.</p>
                            ) : (
                                <div className="flex flex-col divide-y divide-[#2a2a3a]">
                                    {populars.map((b) => (
                                        <div key={b._id}>
                                            <NewsCard berita={b} variant="horizontal" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Latest News widget */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a3a] flex items-center gap-2">
                                📅 Berita Terbaru
                            </h3>
                            {latests.length === 0 ? (
                                <p className="text-xs text-[#8888aa] py-3">Belum ada berita terbaru.</p>
                            ) : (
                                <div className="flex flex-col divide-y divide-[#2a2a3a]">
                                    {latests.map((b) => (
                                        <div key={b._id}>
                                            <NewsCard berita={b} variant="horizontal" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* BERITA TERKAIT — Full width, tampil di mobile dan desktop     */}
                {/* ============================================================ */}
                <section className="mt-12 pt-8 border-t border-[#2a2a3a]">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full bg-[#e63946] inline-block"></span>
                        🔗 Berita Terkait
                    </h2>

                    {loadingRelated ? (
                        <div className="flex justify-center py-10">
                            <div className="spinner"></div>
                        </div>
                    ) : relateds.length === 0 ? (
                        <p className="text-sm text-[#8888aa] py-6 text-center">Tidak ada berita terkait ditemukan.</p>
                    ) : (
                        <>
                            {/* Grid cards — 2 kolom mobile, 3 kolom desktop */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                {relateds.map((b) => (
                                    <NewsCard key={b._id} berita={b} />
                                ))}
                            </div>

                            {/* Pagination berita terkait */}
                            {relatedMeta.totalPages > 1 && (
                                <div className="mt-8 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setRelatedPage(p => Math.max(1, p - 1)); window.scrollTo({ top: document.getElementById('berita-terkait')?.offsetTop || 600, behavior: 'smooth' }); }}
                                            disabled={relatedPage === 1}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#2a2a3a] bg-[#16161f] text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            ← Sebelumnya
                                        </button>

                                        {Array.from({ length: relatedMeta.totalPages }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { setRelatedPage(p); window.scrollTo({ top: 600, behavior: 'smooth' }); }}
                                                className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all ${
                                                    relatedPage === p
                                                        ? 'bg-[#e63946] border-[#e63946] text-white shadow-[0_0_10px_rgba(230,57,70,0.3)]'
                                                        : 'bg-[#16161f] border-[#2a2a3a] text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946]'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ))}

                                        <button
                                            onClick={() => { setRelatedPage(p => Math.min(relatedMeta.totalPages, p + 1)); window.scrollTo({ top: 600, behavior: 'smooth' }); }}
                                            disabled={relatedPage === relatedMeta.totalPages}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#2a2a3a] bg-[#16161f] text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            Berikutnya →
                                        </button>
                                    </div>
                                    <span className="text-xs text-[#555570]">
                                        Halaman {relatedPage} dari {relatedMeta.totalPages} • {relatedMeta.total} berita terkait
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>

            <Footer kategoris={kategoris} />
        </div>
    );
}
