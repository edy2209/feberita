'use client';
import AdminSidebar from '@/components/AdminSidebar';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [isOpen, setIsOpen] = useState(false);

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white">
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0f] text-white relative">
            {/* Sidebar dengan state open/close untuk drawer mobile */}
            <AdminSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
            
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header khusus mobile dengan tombol Burger */}
                <header className="flex items-center justify-between px-5 py-4 bg-[#111118] border-b border-[#2a2a3a] md:hidden shrink-0">
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="text-[#8888aa] hover:text-white p-2 rounded-lg bg-[#16161f] border border-[#2a2a3a] cursor-pointer"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-black text-[#e63946]">RT</span>
                        <span className="text-lg font-black text-white">News</span>
                        <span className="text-[9px] font-bold text-[#8888aa] ml-1 tracking-widest">REDAKSI</span>
                    </div>
                    {/* Spacer dummy agar judul berada di tengah */}
                    <div className="w-10"></div>
                </header>

                <div className="flex-1 flex flex-col min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}

