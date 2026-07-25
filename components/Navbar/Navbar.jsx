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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchVal.trim()) router.push(`/cari?q=${encodeURIComponent(searchVal.trim())}`);
    };

    return (
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

                {/* Search bar - desktop */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg bg-[#16161f] border border-[#2a2a3a] rounded-full overflow-hidden transition-all focus-within:border-[#e63946] focus-within:shadow-[0_0_0_3px_rgba(230,57,70,0.15)]">
                    <input
                        type="text"
                        placeholder="Cari berita..."
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none px-5 py-2.5 text-sm text-white placeholder-[#555570] font-[Inter]"
                    />
                    <button type="submit" className="bg-[#e63946] border-none text-white px-4 py-2.5 cursor-pointer hover:bg-[#c1121f] transition-colors flex items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                    </button>
                </form>

                {/* Hamburger - mobile */}
                <button
                    className="md:hidden ml-auto flex flex-col gap-1.5 bg-transparent border-none cursor-pointer p-1"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <span className="block w-6 h-0.5 bg-white rounded transition-all"></span>
                    <span className="block w-6 h-0.5 bg-white rounded transition-all"></span>
                    <span className="block w-6 h-0.5 bg-white rounded transition-all"></span>
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

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-[#2a2a3a] px-5 py-3 flex flex-col gap-1 bg-[#0a0a0f]">
                    <form onSubmit={handleSearch} className="flex mb-2 bg-[#16161f] border border-[#2a2a3a] rounded-full overflow-hidden">
                        <input
                            type="text"
                            placeholder="Cari berita..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-white placeholder-[#555570]"
                        />
                        <button type="submit" className="bg-[#e63946] px-4 py-2 text-white rounded-r-full">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                    </form>
                    <a href="/" className="px-3 py-2.5 text-sm font-medium text-[#8888aa] hover:text-[#e63946] hover:bg-[rgba(230,57,70,0.1)] rounded-lg transition-all" onClick={() => setMenuOpen(false)}>Semua</a>
                    {kategoris.map((k) => (
                        <Link key={k._id} href={`/?category=${k.slug}`} className="px-3 py-2.5 text-sm font-medium text-[#8888aa] hover:text-[#e63946] hover:bg-[rgba(230,57,70,0.1)] rounded-lg transition-all" onClick={() => setMenuOpen(false)}>
                            {k.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
