'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getJurnalisList, createJurnalis, deleteJurnalis } from '@/lib/api';

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

export default function KelolaJurnalisPage() {
    const router = useRouter();
    const token = Cookies.get('admin_token');

    const [loading, setLoading] = useState(true);
    const [jurnalisList, setJurnalisList] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        if (!token) { router.push('/admin/login'); return; }
        // Check role - only admin can access this page
        const payload = decodeJwt(token);
        if (payload?.role !== 'admin') {
            router.push('/admin');
            return;
        }
        loadData();
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getJurnalisList(token);
            setJurnalisList(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormError('');
        setFormSuccess('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setFormError('Semua kolom wajib diisi.');
            return;
        }
        if (form.password.length < 6) {
            setFormError('Password minimal 6 karakter.');
            return;
        }
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');
        try {
            const res = await createJurnalis(token, form);
            if (res.status === 'success') {
                setForm({ name: '', email: '', password: '' });
                setFormSuccess(`Akun jurnalis "${res.data.name}" berhasil dibuat!`);
                loadData();
            } else {
                setFormError(res.message || 'Gagal membuat akun jurnalis.');
            }
        } catch (err) {
            setFormError('Kesalahan koneksi.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus akun jurnalis "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            const res = await deleteJurnalis(token, id);
            if (res.status === 'success') {
                loadData();
            } else {
                alert(res.message || 'Gagal menghapus akun jurnalis.');
            }
        } catch (err) {
            alert('Kesalahan koneksi.');
        }
    };

    if (!token) return null;

    return (
        <main className="flex-grow p-4 md:p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 border-b border-[#2a2a3a] pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        <span className="text-[#e63946]">👥</span> Kelola Jurnalis
                    </h1>
                    <p className="text-sm text-[#8888aa] mt-1">Buat dan kelola akun jurnalis untuk tim redaksi Anda</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form Tambah Jurnalis */}
                <div className="lg:col-span-2">
                    <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-6">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-[#e63946]">✚</span> Tambah Jurnalis Baru
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#8888aa] mb-1.5 uppercase tracking-wider">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    placeholder="Masukkan nama jurnalis..."
                                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946] focus:shadow-[0_0_0_3px_rgba(230,57,70,0.15)] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#8888aa] mb-1.5 uppercase tracking-wider">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleFormChange}
                                    placeholder="email@domain.com"
                                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946] focus:shadow-[0_0_0_3px_rgba(230,57,70,0.15)] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#8888aa] mb-1.5 uppercase tracking-wider">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleFormChange}
                                    placeholder="Minimal 6 karakter..."
                                    className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#555570] outline-none focus:border-[#e63946] focus:shadow-[0_0_0_3px_rgba(230,57,70,0.15)] transition-all"
                                />
                            </div>

                            {formError && (
                                <div className="bg-[rgba(230,57,70,0.1)] border border-[rgba(230,57,70,0.3)] rounded-lg px-4 py-2.5 text-sm text-[#e63946]">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="bg-[rgba(40,200,100,0.1)] border border-[rgba(40,200,100,0.3)] rounded-lg px-4 py-2.5 text-sm text-green-400">
                                    {formSuccess}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={formLoading}
                                className="w-full btn btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {formLoading ? 'Membuat Akun...' : '+ Buat Akun Jurnalis'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Daftar Jurnalis */}
                <div className="lg:col-span-3">
                    <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-[#2a2a3a] flex items-center justify-between">
                            <h2 className="text-base font-bold text-white">
                                Daftar Jurnalis
                                <span className="ml-2 text-xs font-normal text-[#8888aa]">({jurnalisList.length} akun)</span>
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="spinner"></div>
                            </div>
                        ) : jurnalisList.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-[#8888aa] text-sm">Belum ada akun jurnalis yang terdaftar.</p>
                                <p className="text-[#555570] text-xs mt-1">Buat akun baru menggunakan form di sebelah kiri.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[#2a2a3a]">
                                {jurnalisList.map((j) => (
                                    <li key={j._id} className="flex items-center justify-between px-4 py-4 hover:bg-[#1e1e2a] transition-colors gap-3">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar initials */}
                                            <div className="w-9 h-9 rounded-full bg-[rgba(100,150,255,0.15)] border border-[rgba(100,150,255,0.25)] flex items-center justify-center text-sm font-bold text-[#7aadff] shrink-0">
                                                {j.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{j.name}</p>
                                                <p className="text-xs text-[#8888aa] truncate">{j.email}</p>
                                                <p className="text-[10px] text-[#555570] mt-0.5">
                                                    Bergabung {new Date(j.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[rgba(100,150,255,0.15)] text-[#7aadff] border border-[rgba(100,150,255,0.25)]">
                                                jurnalis
                                            </span>
                                            <button
                                                onClick={() => handleDelete(j._id, j.name)}
                                                className="btn btn-danger btn-sm rounded-lg text-xs"
                                                title="Hapus akun jurnalis ini"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
