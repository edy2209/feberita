'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar({ kategoris = [] }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Tutup menu saat resize ke desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Cegah scroll saat menu mobile terbuka
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchVal.trim()) {
            router.push(`/cari?q=${encodeURIComponent(searchVal.trim())}`);
            setMenuOpen(false);
        }
    };

    return (
        <>
            <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.6)]' : ''} bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a3a]`}>
                {/* Breaking bar */}
                <div className="bg-[#e63946] flex items-center gap-3 px-5 py-1.5 overflow-hidden">
                    <span className="text-[10px] font-extrabold tracking-widest text-white bg-black/20 px-2 py-0.5 rounded shrink-0">BREAKING</span>
                    <span className="text-xs text-white/90 font-medium whitespace-nowrap animate-[marquee_30s_linear_infinite]">
                        Portal Berita Terpercaya Sumatera Barat — RTNewsSumbar
                    </span>
                </div>

                {/* Main nav */}
                <div className="max-w-[1200px] mx-auto px-5 py-3.5 flex items-center gap-5">
                    {/* Logo */}
                    <Link href="/" className="flex items-baseline gap-0.5 shrink-0 group">
                        <span className="text-2xl font-black text-[#e63946]">RT</span>
                        <span className="text-2xl font-black text-white">News</span>
                        <span className="text-sm font-semibold text-[#8888aa] ml-0.5">Sumbar</span>
                    </Link>

                    {/* Search bar - selalu tampil di semua ukuran layar */}
                    <form onSubmit={handleSearch} className="flex flex-1 max-w-lg bg-[#16161f] border border-[#2a2a3a] rounded-full overflow-hidden transition-all focus-within:border-[#e63946] focus-within:shadow-[0_0_0_3px_rgba(230,57,70,0.15)]">
                        <input
                            type="text"
                            placeholder="Cari berita..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none px-5 py-2.5 text-sm text-white placeholder-[#555570] font-[Inter] min-w-0"
                        />
                        <button type="submit" className="bg-[#e63946] border-none text-white px-4 py-2.5 cursor-pointer hover:bg-[#c1121f] transition-colors flex items-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                    </form>

                    {/* Hamburger / X Button - mobile only */}
                    <button
                        className="md:hidden shrink-0 relative w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                    >
                        {/* Hamburger lines — transform jadi X saat terbuka */}
                        <span className={`absolute block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'}`}></span>
                        <span className={`absolute block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}></span>
                        <span className={`absolute block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'}`}></span>
                    </button>
                </div>

                {/* Category bar */}
                <div className="border-t border-[#2a2a3a]">
                    <div className="max-w-[1200px] mx-auto px-5 flex gap-1 overflow-x-auto scrollbar-hide">
                        <a href="/" className="px-4 py-2.5 text-xs font-semibold text-[#8888aa] hover:text-[#e63946] whitespace-nowrap border-b-2 border-transparent hover:border-[#e63946] transition-all">
                            Semua
                        </a>
                        {kategoris.map((k) => (
                            <Link key={k._id} href={`/?category=${k.slug}`} className="px-4 py-2.5 text-xs font-semibold text-[#8888aa] hover:text-[#e63946] whitespace-nowrap border-b-2 border-transparent hover:border-[#e63946] transition-all">
                                {k.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {menuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer Sidebar */}
            <div className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[#0d0d14] border-l border-[#2a2a3a] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a]">
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black text-[#e63946]">RT</span>
                        <span className="text-lg font-black text-white">News</span>
                        <span className="text-xs font-semibold text-[#8888aa] ml-0.5">Sumbar</span>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e1e2a] border border-[#2a2a3a] text-[#8888aa] hover:text-white hover:bg-[#e63946] hover:border-[#e63946] transition-all cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Category links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="text-[10px] font-bold text-[#555570] uppercase tracking-widest px-3 mb-2">Kategori Berita</p>
                    <a
                        href="/"
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#8888aa] hover:text-[#e63946] hover:bg-[rgba(230,57,70,0.08)] rounded-lg transition-all"
                        onClick={() => setMenuOpen(false)}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Semua Berita
                    </a>
                    {kategoris.map((k) => (
                        <Link
                            key={k._id}
                            href={`/?category=${k.slug}`}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#8888aa] hover:text-[#e63946] hover:bg-[rgba(230,57,70,0.08)] rounded-lg transition-all"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e63946]/50 shrink-0"></span>
                            {k.name}
                        </Link>
                    ))}
                </nav>

                {/* Footer info */}
                <div className="px-5 py-4 border-t border-[#2a2a3a]">
                    <p className="text-[10px] text-[#555570] text-center">© RTNewsSumbar — Portal Berita Terpercaya</p>
                </div>
            </div>
        </>
    );
}
