import Link from 'next/link';
import Image from 'next/image';

export default function NewsCard({ berita, variant = 'default' }) {
    const formattedDate = new Date(berita.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    if (variant === 'hero') {
        return (
            <Link href={`/berita/${berita.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[16/9] shadow-xl">
                <img
                    src={berita.thumbnail}
                    alt={berita.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/800x450/16161f/555570?text=RTNewsSumbar'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block bg-[#e63946] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                        {berita.category}
                    </span>
                    <h2 className="text-white text-2xl font-bold leading-tight line-clamp-3 group-hover:text-[#e63946] transition-colors">
                        {berita.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-white/60 text-xs">{berita.author?.name || 'Redaksi'}</span>
                        <span className="text-white/40 text-xs">•</span>
                        <span className="text-white/60 text-xs">{formattedDate}</span>
                        <span className="text-white/40 text-xs">•</span>
                        <span className="text-white/60 text-xs flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            {berita.jumlah_penonton?.toLocaleString('id-ID') || 0}
                        </span>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'horizontal') {
        return (
            <Link href={`/berita/${berita.slug}`} className="group flex gap-4 p-4 rounded-xl hover:bg-[#16161f] border border-transparent hover:border-[#2a2a3a] transition-all">
                <img
                    src={berita.thumbnail}
                    alt={berita.title}
                    className="w-24 h-18 object-cover rounded-lg shrink-0"
                    style={{ height: '72px' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/96x72/16161f/555570?text=RT'; }}
                />
                <div className="flex-1 min-w-0">
                    <span className="text-[#e63946] text-xs font-semibold uppercase">{berita.category}</span>
                    <h3 className="text-sm font-semibold text-[#f0f0f5] group-hover:text-[#e63946] line-clamp-2 mt-0.5 transition-colors leading-snug">{berita.title}</h3>
                    <span className="text-[#8888aa] text-xs mt-1 block">{formattedDate}</span>
                </div>
            </Link>
        );
    }

    // Default card
    return (
        <Link href={`/berita/${berita.slug}`} className="group bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden hover:border-[#e63946] hover:shadow-[0_0_30px_rgba(230,57,70,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="relative overflow-hidden aspect-[16/10]">
                <img
                    src={berita.thumbnail}
                    alt={berita.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x250/16161f/555570?text=RTNewsSumbar'; }}
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-[#e63946] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {berita.category}
                    </span>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-[#f0f0f5] line-clamp-2 group-hover:text-[#e63946] transition-colors leading-snug mb-2">
                    {berita.title}
                </h3>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#2a2a3a]">
                    <span className="text-[#8888aa] text-xs">{berita.author?.name || 'Redaksi'}</span>
                    <span className="text-[#555570] text-xs">•</span>
                    <span className="text-[#8888aa] text-xs">{formattedDate}</span>
                    <span className="ml-auto text-[#555570] text-xs flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {berita.jumlah_penonton?.toLocaleString('id-ID') || 0}
                    </span>
                </div>
            </div>
        </Link>
    );
}
