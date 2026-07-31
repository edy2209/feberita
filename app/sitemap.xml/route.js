export const dynamic = 'force-dynamic';

const BASE_URL = 'https://rtnewssumbar.my.id';
const API_URL = process.env.SERVER_API_URL || 'http://app:3000';

async function getAllBerita() {
    try {
        // Ambil hingga 1000 berita terbaru untuk sitemap
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

export async function GET() {
    const articles = await getAllBerita();

    // Buat XML manual agar 100% bersih tanpa header RSC Next.js
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  ${articles.map((b) => `
  <url>
    <loc>${BASE_URL}/berita/${b.slug}</loc>
    <lastmod>${b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`.trim();

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
        },
    });
}
