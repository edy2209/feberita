// Cek URL API dinamis: gunakan SERVER_API_URL saat di server (SSR), fallback ke NEXT_PUBLIC_API_URL di client (browser)
const getApiUrl = () => {
    if (typeof window === 'undefined') {
        // SSR / Server Component di Docker
        return process.env.SERVER_API_URL || 'http://app:3000';
    }
    // Browser client
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const getFetchUrl = (endpoint) => {
    const baseUrl = getApiUrl();
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanEndpoint}`;
};

// ============================================================
// Helper: Penanganan Response API untuk menghindari crash JSON
// ============================================================
const handleResponse = async (res, defaultErrorMessage = 'Terjadi kesalahan pada server') => {
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
            try {
                const errData = await res.json();
                return { status: 'error', message: errData.message || defaultErrorMessage };
            } catch (_) {
                return { status: 'error', message: `${defaultErrorMessage} (Status ${res.status})` };
            }
        } else {
            try {
                const text = await res.text();
                // Jika itu halaman error HTML (dari Nginx/aaPanel), bersihkan tag HTML-nya
                const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
                return { status: 'error', message: `Server Error (${res.status}): ${cleanText || 'Detail tidak tersedia'}` };
            } catch (_) {
                return { status: 'error', message: `Server Error (${res.status})` };
            }
        }
    }
    
    if (contentType && contentType.includes('application/json')) {
        return res.json();
    }
    return { status: 'success' };
};

// ======== POST BERITA ========
export async function getBeritaList({ page = 1, limit = 10, category = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (category) params.set('category', category);
    const res = await fetch(getFetchUrl(`/post-berita?${params}`), { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil daftar berita');
    return res.json();
}

export async function getBeritaBySlug(slug, token = null) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(getFetchUrl(`/post-berita/${slug}`), { cache: 'no-store', headers });
    if (!res.ok) return null;
    return res.json();
}

export async function getBeritaPopular(limit = 5) {
    const res = await fetch(getFetchUrl(`/post-berita/popular?limit=${limit}`), { cache: 'no-store' });
    if (!res.ok) return { data: [] };
    return res.json();
}

export async function getRelatedBerita(slug, page = 1, limit = 6) {
    const params = new URLSearchParams({ slug, page, limit });
    const res = await fetch(getFetchUrl(`/post-berita/related?${params}`), { cache: 'no-store' });
    if (!res.ok) return { data: [], meta: { page: 1, totalPages: 1, total: 0 } };
    return res.json();
}

export async function searchBerita(q) {
    const res = await fetch(getFetchUrl(`/post-berita/search?q=${encodeURIComponent(q)}`), { cache: 'no-store' });
    if (!res.ok) return { data: [] };
    return res.json();
}

export async function incrementView(slug) {
    await fetch(getFetchUrl(`/post-berita/${slug}/view`), { method: 'PATCH' });
}

// ======== KATEGORI ========
export async function getKategori() {
    const res = await fetch(getFetchUrl('/category'), { cache: 'no-store' });
    if (!res.ok) return { data: [] };
    return res.json();
}

// ======== ADMIN AUTH ========
export async function loginAdmin({ email, password }) {
    const res = await fetch(getFetchUrl('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res, 'Login gagal, periksa email dan password Anda');
}

// ======== ADMIN BERITA ========
export async function getBeritaAdmin(token, { page = 1, limit = 10, status = '', search = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const res = await fetch(getFetchUrl(`/post-berita?${params}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    return res.json();
}

export async function createBerita(token, data) {
    const res = await fetch(getFetchUrl('/post-berita'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, 'Gagal menyimpan berita');
}

export async function updateBerita(token, slug, data) {
    const res = await fetch(getFetchUrl(`/post-berita/${slug}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, 'Gagal memperbarui berita');
}

export async function deleteBerita(token, slug) {
    const res = await fetch(getFetchUrl(`/post-berita/${slug}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res, 'Gagal menghapus berita');
}

export async function publishBerita(token, slug) {
    const res = await fetch(getFetchUrl(`/post-berita/${slug}/publish`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res, 'Gagal mempublikasikan berita');
}

// ======== ADMIN KATEGORI ========
export async function createKategori(token, name) {
    const res = await fetch(getFetchUrl('/category'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    return handleResponse(res, 'Gagal membuat kategori baru');
}

export async function deleteKategori(token, slug) {
    const res = await fetch(getFetchUrl(`/category/${slug}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res, 'Gagal menghapus kategori');
}

export async function uploadImage(token, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(getFetchUrl('/upload'), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    return handleResponse(res, 'Gagal mengunggah file gambar');
}

// ======== ADMIN JURNALIS ========
export async function getJurnalisList(token) {
    const res = await fetch(getFetchUrl('/admin/users'), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    return res.json();
}

export async function createJurnalis(token, data) {
    const res = await fetch(getFetchUrl('/admin/users'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, 'Gagal menambahkan jurnalis baru');
}

export async function deleteJurnalis(token, id) {
    const res = await fetch(getFetchUrl(`/admin/users/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res, 'Gagal menghapus jurnalis');
}
