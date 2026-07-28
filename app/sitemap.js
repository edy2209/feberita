// Sitemap.xml otomatis Next.js App Router
// Akses: https://rtnewssumbar.my.id/sitemap.xml
// Otomatis mengambil semua artikel published dari database

export const dynamic = 'force-dynamic'; // Selalu render server-side, tidak di-cache saat build

const BASE_URL = 'https://rtnewssumbar.my.id';
// Saat berjalan di dalam Docker container, gunakan URL internal
const API_URL = process.env.SERVER_API_URL || 'http://app:3000';

async function getAllBerita() {
    try {
        // Ambil hingga 1000 berita sekaligus untuk sitemap
        const res = await fetch(`${API_URL}/post-berita?page=1&limit=1000`, {
            cache: 'no-store',
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (err) {
        console.error('[sitemap] Gagal mengambil daftar berita:', err);
        return [];
    }
}

export default async function sitemap() {
    // Halaman statis utama
    const staticPages = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1.0,
        },
    ];

    // Halaman dinamis dari artikel berita
    const articles = await getAllBerita();
    const articlePages = articles.map((berita) => ({
        url: `${BASE_URL}/berita/${berita.slug}`,
        lastModified: berita.updatedAt ? new Date(berita.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...articlePages];
}
