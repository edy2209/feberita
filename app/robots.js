// Robots.txt otomatis Next.js App Router
// Akses: https://rtnewssumbar.my.id/robots.txt

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
        sitemap: 'https://rtnewssumbar.my.id/sitemap-news.xml',
    };
}
