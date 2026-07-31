import Link from 'next/link';

export default function Footer({ kategoris = [] }) {
    return (
        <footer className="border-t border-[#2a2a3a] bg-[#0a0a0f] mt-20">
            <div className="max-w-[1200px] mx-auto px-5 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-baseline gap-0.5 mb-4">
                            <span className="text-2xl font-black text-[#e63946]">RT</span>
                            <span className="text-2xl font-black text-white logo-news-text">News</span>
                            <span className="text-sm font-semibold text-[#8888aa] ml-0.5">Sumbar</span>
                        </div>
                        {/* bikin tulisan rata kiri dan kanan */}
                        <p className="text-sm text-[#8888aa] leading-relaxed mb-4 text-justify ">
                            Portal berita terpercaya Sumatera Barat. Menyajikan informasi akurat, cepat, dan berimbang untuk masyarakat Sumbar.
                        </p>
                    </div>

                    {/* Kategori */}
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Kategori</h4>
                        <ul className="space-y-2">
                            {kategoris.slice(0, 6).map((k) => (
                                <li key={k._id}>
                                    <Link href={`/?category=${k.slug}`} className="text-sm text-[#8888aa] hover:text-[#e63946] transition-colors">
                                        {k.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Tentang Kami</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-sm text-[#8888aa] hover:text-[#e63946] transition-colors">Beranda</Link></li>
                            <li><Link href="/tentang" className="text-sm text-[#8888aa] hover:text-[#e63946] transition-colors">Profil Redaksi</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#2a2a3a] mt-10 pt-6 text-center">
                    <p className="text-xs text-[#555570]">
                        © {new Date().getFullYear()} RTNewsSumbar. Semua hak cipta dilindungi.
                    </p>
                </div>
            </div>
        </footer>
    );
}

