import { getBeritaBySlug, getBeritaPopular, getKategori, getBeritaList } from '@/lib/api';
import BeritaDetailClient from '@/components/BeritaDetailClient';
import { notFound } from 'next/navigation';

// ============================================================
// DYNAMIC SEO METADATA (SSR)
// Dijalankan di server saat bot pencari / medsos mengakses halaman
// ============================================================
export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await getBeritaBySlug(slug);
        if (!res || !res.data) {
            return {
                title: 'Berita Tidak Ditemukan — RTNewsSumbar',
            };
        }

        const berita = res.data;
        // Bersihkan tag HTML untuk ringkasan deskripsi
        const plainTextExcerpt = (berita.content || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 160);

        return {
            title: `${berita.title} — RTNewsSumbar`,
            description: `${plainTextExcerpt}...`,
            openGraph: {
                title: berita.title,
                description: `${plainTextExcerpt}...`,
                images: [{ url: berita.thumbnail }],
                type: 'article',
                authors: [berita.author?.name || 'Redaksi'],
                section: berita.category,
            },
            twitter: {
                card: 'summary_large_image',
                title: berita.title,
                description: `${plainTextExcerpt}...`,
                images: [berita.thumbnail],
            }
        };
    } catch (err) {
        console.error('Error generating metadata:', err);
        return {
            title: 'RTNewsSumbar — Portal Berita Terpercaya',
        };
    }
}

// ============================================================
// SERVER COMPONENT PAGE
// Mengambil data di server sebelum halaman dimuat (sangat cepat & SEO bersahabat)
// ============================================================
export default async function Page({ params }) {
    const { slug } = await params;

    // Fetch data paralel di server
    const [beritaRes, catsRes, popsRes, latsRes] = await Promise.all([
        getBeritaBySlug(slug),
        getKategori(),
        getBeritaPopular(5),
        getBeritaList({ limit: 5 })
    ]);

    if (!beritaRes || !beritaRes.data) {
        notFound();
    }

    const berita = beritaRes.data;
    const kategoris = catsRes.data || [];
    const populars = popsRes.data || [];
    const latests = latsRes.data || [];

    return (
        <BeritaDetailClient
            berita={berita}
            kategoris={kategoris}
            populars={populars}
            latests={latests}
            slug={slug}
        />
    );
}
