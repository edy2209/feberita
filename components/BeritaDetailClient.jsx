'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import { incrementView } from '@/lib/api';

export default function BeritaDetailClient({ berita, populars = [], latests = [], kategoris = [], slug }) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!slug) return;
        // Panggil increment view count secara async di background (hanya di client browser)
        incrementView(slug).catch(err => console.error('Gagal menaikkan views:', err));
    }, [slug]);

    if (!berita) return null;

    // ============================================================
    // Normalisasi konten: tangani berbagai format <!--nextpage-->
    // yang mungkin tersimpan di DB (lama vs baru)
    // ============================================================
    const normalizeContent = (raw) => {
        return (raw || '')
            // Format lama: user mengetik manual → TipTap escape → &lt;!--nextpage--&gt;
            .replace(/&lt;!--nextpage--&gt;/gi, '<!--nextpage-->')
            // Jika dibungkus tag <p> oleh TipTap
            .replace(/<p>\s*<!--nextpage-->\s*<\/p>/gi, '<!--nextpage-->')
            // Jika ada whitespace di sekitar marker
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left/Main Column: News Article */}
                    <article className="lg:col-span-2">
                        {/* Meta info */}
                        <div className="mb-4">
                            <span className="bg-[#e63946] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                {berita.category}
                            </span>
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

                        {/* Article body content rendered via dangerouslySetInnerHTML to parse HTML tags from TipTap */}
                        <div
                            className="prose-news"
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                        />

                        {/* Content Pagination (Halaman 1, 2, 3...) */}
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

                    {/* Right Column: Sidebar */}
                    <div className="space-y-10">
                        {/* Popular widget */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a3a] flex items-center gap-2">
                                🔥 Paling Populer
                            </h3>
                            {populars.length === 0 ? (
                                <p className="text-xs text-[#8888aa] py-3">Belum ada berita terpopuler.</p>
                            ) : (
                                <>
                                    {/* Mobile: card besar bisa digeser */}
                                    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide md:hidden">
                                        {populars.map((b) => (
                                            <div key={b._id} className="w-[240px] shrink-0 flex">
                                                <NewsCard berita={b} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop: horizontal list di sidebar */}
                                    <div className="hidden md:flex md:flex-col md:divide-y md:divide-[#2a2a3a]">
                                        {populars.map((b) => (
                                            <div key={b._id}>
                                                <NewsCard berita={b} variant="horizontal" />
                                            </div>
                                        ))}
                                    </div>
                                </>
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
                                <>
                                    {/* Mobile: card besar bisa digeser */}
                                    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide md:hidden">
                                        {latests.map((b) => (
                                            <div key={b._id} className="w-[240px] shrink-0 flex">
                                                <NewsCard berita={b} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop: horizontal list di sidebar */}
                                    <div className="hidden md:flex md:flex-col md:divide-y md:divide-[#2a2a3a]">
                                        {latests.map((b) => (
                                            <div key={b._id}>
                                                <NewsCard berita={b} variant="horizontal" />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer kategoris={kategoris} />
        </div>
    );
}
