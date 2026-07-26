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
    return res.json();
}

// ======== ADMIN BERITA ========
export async function getBeritaAdmin(token, { page = 1, limit = 10, status = '' } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (status) params.set('status', status);
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
    return res.json();
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
    return res.json();
}

export async function deleteBerita(token, slug) {
    const res = await fetch(getFetchUrl(`/post-berita/${slug}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function publishBerita(token, slug) {
    const res = await fetch(getFetchUrl(`/post-berita/${slug}/publish`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
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
    return res.json();
}

export async function deleteKategori(token, slug) {
    const res = await fetch(getFetchUrl(`/category/${slug}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
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
    return res.json();
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
    return res.json();
}

export async function deleteJurnalis(token, id) {
    const res = await fetch(getFetchUrl(`/admin/users/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}
