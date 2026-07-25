import './globals.css';

export const metadata = {
    title: 'RTNewsSumbar — Portal Berita Terpercaya Sumatera Barat',
    description: 'Berita terkini, terpercaya, dan akurat dari Sumatera Barat. RTNewsSumbar — Sumber Informasi Anda.',
    keywords: 'berita, sumbar, sumatera barat, news, terkini, terpercaya',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] antialiased">
                {children}
            </body>
        </html>
    );
}
