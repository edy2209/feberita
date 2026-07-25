'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { loginAdmin } from '@/lib/api';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginAdmin({ email, password });
            if (res.status === 'success' && res.token) {
                // Simpan token di Cookie selama 1 hari
                Cookies.set('admin_token', res.token, { expires: 1 });
                // Redirect ke Dashboard Admin
                router.push('/admin');
            } else {
                setError(res.message || 'Login gagal, periksa email dan password.');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-[#e63946]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-[#e63946]/5 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center items-baseline gap-0.5 mb-8">
                    <Link href="/" className="flex items-baseline gap-0.5">
                        <span className="text-3xl font-black text-[#e63946]">RT</span>
                        <span className="text-3xl font-black text-white">News</span>
                        <span className="text-sm font-semibold text-[#8888aa] ml-0.5">Redaksi</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-2">Masuk Ruang Redaksi</h2>
                    <p className="text-xs text-[#8888aa] mb-6">Masukkan kredensial khusus jurnalis & admin RTNewsSumbar</p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                required
                                placeholder="nama@rtnewssumbar.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full justify-center py-3 text-sm rounded-lg"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memverifikasi...
                                </span>
                            ) : (
                                'Masuk Sekarang'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-xs text-[#8888aa] hover:text-white transition-colors">
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
