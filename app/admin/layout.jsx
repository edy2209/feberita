'use client';
import AdminSidebar from '@/components/AdminSidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white">
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0f] text-white">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}

