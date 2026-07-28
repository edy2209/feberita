'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import NewsCard from '@/components/NewsCard';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import HeroCarousel from '@/components/HeroCarousel';
import { getBeritaList, getBeritaPopular, getKategori } from '@/lib/api';

function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeCategory = searchParams.get('category') || '';
    const activePage = parseInt(searchParams.get('page')) || 1;

    const [kategoris, setKategoris] = useState([]);
    const [beritas, setBeritas] = useState([]);
    const [populars, setPopulars] = useState([]);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, limit: 15, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch static menu data
        const loadCategoriesAndPopulars = async () => {
            try {
                const [cats, pops] = await Promise.all([getKategori(), getBeritaPopular(5)]);
                setKategoris(cats.data || []);
                setPopulars(pops.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadCategoriesAndPopulars();
    }, []);

    useEffect(() => {
        const loadBerita = async () => {
            setLoading(true);
            try {
                const res = await getBeritaList({
                    page: activePage,
                    limit: 10, // Tampilkan 10 berita per halaman
                    category: activeCategory
                });
                setBeritas(res.data || []);
                setMeta(res.meta || { page: 1, totalPages: 1, limit: 10, total: 0 });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadBerita();
    }, [activeCategory, activePage]);

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage);
        router.push(`/?${params.toString()}`);
    };

    const isMainHome = activePage === 1 && !activeCategory;
    const carouselNews = isMainHome ? beritas.slice(0, 5) : [];
    const gridNews = beritas; // Tampilkan seluruh daftar berita terbaru agar tidak kosong

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar kategoris={kategoris} />

            <main className="flex-grow max-w-[1200px] w-full mx-auto px-5 py-8">
                {loading && beritas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="spinner"></div>
                        <p className="mt-4 text-[#8888aa] text-sm">Memuat berita untuk Anda...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left/Main Column: News list */}
                        <div className="lg:col-span-2">
                            {beritas.length === 0 ? (
                                <div className="text-center py-20 bg-[#16161f] border border-[#2a2a3a] rounded-xl">
                                    <p className="text-[#8888aa] text-sm">Tidak ada berita yang ditemukan.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Hero Banner Slider (Only on page 1 and no category filtered) */}
                                    {isMainHome && carouselNews.length > 0 && (
                                        <div className="mb-10">
                                            <h2 className="text-[#8888aa] text-xs font-bold uppercase tracking-wider mb-3">Sorotan Utama</h2>
                                            <HeroCarousel items={carouselNews} />
                                        </div>
                                    )}

                                    {/* News Grid */}
                                    <h2 className="text-lg font-bold text-white mb-6 border-b border-[#2a2a3a] pb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#e63946]"></span>
                                        {activeCategory ? `Kategori: ${kategoris.find(k => k.slug === activeCategory)?.name || activeCategory}` : 'Berita Terbaru'}
                                    </h2>

                                    {gridNews.length === 0 ? (
                                        <p className="text-sm text-[#8888aa] py-6">Belum ada berita tambahan di daftar ini.</p>
                                    ) : (
                                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide md:grid md:grid-cols-2 md:gap-6 md:pb-0">
                                            {gridNews.map((b) => (
                                                <div key={b._id} className="w-[280px] shrink-0 md:w-auto flex">
                                                    <NewsCard berita={b} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={meta.page}
                                        totalPages={meta.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </div>

                        {/* Right Column: Sidebar */}
                        <div className="space-y-10">
                            {/* Popular News widget */}
                            <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a3a] flex items-center gap-2">
                                    🔥 Paling Populer
                                </h3>
                                {populars.length === 0 ? (
                                    <p className="text-xs text-[#8888aa] py-3">Belum ada berita terpopuler.</p>
                                ) : (
                                    <>
                                        {/* Mobile: card besar seperti Berita Terbaru, bisa digeser */}
                                        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide md:hidden">
                                            {populars.map((b) => (
                                                <div key={b._id} className="w-[260px] shrink-0 flex">
                                                    <NewsCard berita={b} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Desktop: horizontal list di sidebar */}
                                        <div className="hidden md:flex md:flex-col md:divide-y md:divide-[#2a2a3a]">
                                            {populars.map((b) => (
                                                <div key={b._id} className="w-full">
                                                    <NewsCard berita={b} variant="horizontal" />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Tags/Quick Categories widget */}
                            <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a3a]">
                                    📂 Topik Pilihan
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {kategoris.map((k) => (
                                        <a
                                            key={k._id}
                                            href={`/?category=${k.slug}`}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                activeCategory === k.slug
                                                    ? 'bg-[#e63946] border-[#e63946] text-white'
                                                    : 'bg-[#0a0a0f] border-[#2a2a3a] text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946]'
                                            }`}
                                        >
                                            {k.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer kategoris={kategoris} />
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
                <div className="spinner"></div>
                <p className="mt-4 text-[#8888aa] text-sm">Memuat berita...</p>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
