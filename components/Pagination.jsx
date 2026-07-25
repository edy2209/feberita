'use client';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const range = 2;
    for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16161f] border border-[#2a2a3a] text-sm font-medium text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                ← Sebelumnya
            </button>

            {pages[0] > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="w-10 h-10 rounded-lg bg-[#16161f] border border-[#2a2a3a] text-sm font-semibold text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946] transition-all">1</button>
                    {pages[0] > 2 && <span className="text-[#555570]">…</span>}
                </>
            )}

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-all ${
                        p === currentPage
                            ? 'bg-[#e63946] border-[#e63946] text-white shadow-[0_0_15px_rgba(230,57,70,0.4)]'
                            : 'bg-[#16161f] border-[#2a2a3a] text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946]'
                    }`}
                >
                    {p}
                </button>
            ))}

            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="text-[#555570]">…</span>}
                    <button onClick={() => onPageChange(totalPages)} className="w-10 h-10 rounded-lg bg-[#16161f] border border-[#2a2a3a] text-sm font-semibold text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946] transition-all">{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16161f] border border-[#2a2a3a] text-sm font-medium text-[#8888aa] hover:border-[#e63946] hover:text-[#e63946] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Berikutnya →
            </button>
        </div>
    );
}
