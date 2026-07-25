'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroCarousel({ items = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-play cycle every 5 seconds
    useEffect(() => {
        if (items.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items]);

    if (!items || items.length === 0) return null;

    const currentItem = items[activeIndex];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-[#111118] border border-[#2a2a3a] group shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
            {/* Slides container */}
            <div className="relative w-full h-full">
                {items.map((b, index) => {
                    const isActive = index === activeIndex;
                    const formattedDate = new Date(b.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    });

                    return (
                        <div
                            key={b._id}
                            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
                            }`}
                        >
                            {/* Image Background */}
                            <img
                                src={b.thumbnail}
                                alt={b.title}
                                className="w-full h-full object-cover select-none"
                                onError={(e) => { e.target.src = 'https://placehold.co/1200x500/16161f/555570?text=RTNewsSumbar'; }}
                            />

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20 flex flex-col justify-end">
                                <div className="max-w-2xl">
                                    {/* Category tag */}
                                    <span className="inline-block bg-[#e63946] text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3 md:mb-4 shadow-[0_2px_10px_rgba(230,57,70,0.4)]">
                                        {b.category}
                                    </span>

                                    {/* Title */}
                                    <Link href={`/berita/${b.slug}`}>
                                        <h3 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight hover:text-[#e63946] transition-colors line-clamp-2 drop-shadow-md">
                                            {b.title}
                                        </h3>
                                    </Link>

                                    {/* Meta data */}
                                    <div className="flex items-center gap-3 mt-3 text-xs md:text-sm text-[#8888aa]">
                                        <span className="text-[#f0f0f5] font-semibold">{b.author?.name || 'Redaksi'}</span>
                                        <span className="text-[#555570]">•</span>
                                        <span>{formattedDate}</span>
                                        <span className="text-[#555570]">•</span>
                                        <span className="flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            {b.jumlah_penonton?.toLocaleString('id-ID') || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Left & Right Navigation Arrows */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-[#e63946] text-white border border-[#2a2a3a] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer shadow-lg"
                        title="Slide sebelumnya"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-[#e63946] text-white border border-[#2a2a3a] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer shadow-lg"
                        title="Slide berikutnya"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </>
            )}

            {/* Navigation Dots Indicator */}
            {items.length > 1 && (
                <div className="absolute bottom-6 right-6 md:right-12 z-30 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                index === activeIndex ? 'bg-[#e63946] scale-125' : 'bg-white/40 hover:bg-white'
                            }`}
                            title={`Pergi ke halaman ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
}
