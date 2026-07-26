'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

// Decode JWT payload without external library
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

const baseMenuItems = [
    {
        href: '/admin',
        label: 'Dashboard',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
        ),
        exact: true,
    },
    {
        href: '/admin/berita/buat',
        label: 'Tulis Berita',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
        ),
    },
    {
        href: '/admin/kategori',
        label: 'Kelola Kategori',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        ),
    },
];

const adminOnlyMenuItems = [
    {
        href: '/admin/jurnalis',
        label: 'Kelola Jurnalis',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = Cookies.get('admin_token');
        if (token) {
            const payload = decodeJwt(token);
            setUserRole(payload?.role || null);
        }
    }, []);

    const handleLogout = () => {
        Cookies.remove('admin_token');
        router.push('/');
    };

    const menuItems = userRole === 'admin'
        ? [...baseMenuItems, ...adminOnlyMenuItems]
        : baseMenuItems;

    return (
        <aside className="w-64 shrink-0 bg-[#111118] border-r border-[#2a2a3a] min-h-screen flex flex-col sticky top-0 h-screen">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-[#2a2a3a]">
                <Link href="/" className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-[#e63946]">RT</span>
                    <span className="text-xl font-black text-white">News</span>
                    <span className="text-[10px] font-bold text-[#8888aa] ml-1 tracking-widest">REDAKSI</span>
                </Link>
                {userRole && (
                    <span className={`mt-1 inline-block text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                        userRole === 'admin'
                            ? 'bg-[rgba(230,57,70,0.15)] text-[#e63946] border border-[rgba(230,57,70,0.25)]'
                            : 'bg-[rgba(100,150,255,0.15)] text-[#7aadff] border border-[rgba(100,150,255,0.25)]'
                    }`}>
                        {userRole}
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-[#555570] uppercase tracking-widest px-3 mb-2">Menu Utama</p>
                {menuItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                    ? 'bg-[rgba(230,57,70,0.15)] text-[#e63946] border border-[rgba(230,57,70,0.25)]'
                                    : 'text-[#8888aa] hover:bg-[#1e1e2a] hover:text-white'
                            }`}
                        >
                            <span className={isActive ? 'text-[#e63946]' : 'text-[#555570]'}>
                                {item.icon}
                            </span>
                            {item.label}
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e63946]"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="px-3 py-4 border-t border-[#2a2a3a] space-y-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8888aa] hover:bg-[#1e1e2a] hover:text-white transition-all"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Lihat Website
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#e74c3c] hover:bg-[rgba(231,76,60,0.1)] transition-all border-none bg-transparent cursor-pointer"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Keluar
                </button>
            </div>
        </aside>
    );
}
