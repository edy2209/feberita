import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
    title: 'RTNewsSumbar — Portal Berita Terpercaya Sumatera Barat',
    description: 'Berita terkini, terpercaya, dan akurat dari Sumatera Barat. RTNewsSumbar — Sumber Informasi Anda.',
    keywords: 'berita, sumbar, sumatera barat, news, terkini, terpercaya',
    icons: {
        icon: '/favicon.png',
        apple: '/favicon.png',
        shortcut: '/favicon.png',
    },
};

export default function RootLayout({ children }) {
    return (
        // suppressHydrationWarning diperlukan karena ThemeProvider mengubah class di sisi klien
        <html lang="id" suppressHydrationWarning>
            <body className="min-h-screen antialiased">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
