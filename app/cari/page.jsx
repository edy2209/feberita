'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import { searchBerita, getKategori } from '@/lib/api';

function CariContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';

    const [kategoris, setKategoris] = useState([]);
    const [beritas, setBeritas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await getKategori();
                setKategoris(cats.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const executeSearch = async () => {
            if (!q) {
                setBeritas([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await searchBerita(q);
                setBeritas(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        executeSearch();
    }, [q]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar kategoris={kategoris} />

            <main className="flex-grow max-w-[1200px] w-full mx-auto px-5 py-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    Hasil Pencarian untuk: <span className="text-[#e63946]">"{q}"</span>
                </h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="spinner"></div>
                        <p className="mt-4 text-[#8888aa] text-sm">Mencari artikel...</p>
                    </div>
                ) : (
                    <>
                        {beritas.length === 0 ? (
                            <div className="text-center py-20 bg-[#16161f] border border-[#2a2a3a] rounded-xl">
                                <p className="text-[#8888aa] text-sm mb-2">Maaf, kami tidak dapat menemukan berita yang cocok.</p>
                                <p className="text-[#555570] text-xs">Cobalah cari dengan kata kunci lain.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {beritas.map((b) => (
                                    <NewsCard key={b._id} berita={b} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer kategoris={kategoris} />
        </div>
    );
}

export default function CariPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
                <div className="spinner"></div>
                <p className="mt-4 text-[#8888aa] text-sm">Memuat...</p>
            </div>
        }>
            <CariContent />
        </Suspense>
    );
}
