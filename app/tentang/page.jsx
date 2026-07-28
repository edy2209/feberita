import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer';
import { getKategori } from '@/lib/api';

export const metadata = {
    title: 'Tentang Kami — RTNewsSumbar',
    description: 'Profil redaksi, struktur organisasi, dan informasi kontak portal berita RTNewsSumbar — Portal Berita Terpercaya Sumatera Barat.',
};

export default async function TentangPage() {
    let kategoris = [];
    try {
        const res = await getKategori();
        kategoris = res.data || [];
    } catch (_) {}

    const team = [
        { role: 'Penanggung Jawab', name: 'Edy Syafrianto, S.Kom' },
        { role: 'Pemimpin Redaksi', name: 'Edy Syafrianto, S.Kom' },
        { role: 'Editor', name: 'Edy Syafrianto, S.Kom' },
        { role: 'Reporter', name: 'Tim RTNewsSumbar' },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar kategoris={kategoris} />

            <main className="flex-grow max-w-[1200px] w-full mx-auto px-5 py-12">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="flex items-baseline justify-center gap-0.5 mb-4">
                        <span className="text-4xl font-black text-[#e63946]">RT</span>
                        <span className="text-4xl font-black text-white">News</span>
                        <span className="text-xl font-semibold text-[#8888aa] ml-1">Sumbar</span>
                    </div>
                    <p className="text-[#8888aa] text-base max-w-xl mx-auto leading-relaxed">
                        Portal Berita Terpercaya Sumatera Barat — Menyajikan informasi akurat, cepat, dan berimbang untuk masyarakat Sumbar.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Tentang Portal */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profil */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-7">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 rounded-full bg-[#e63946] inline-block"></span>
                                Profil Kami
                            </h2>
                            <div className="text-sm text-[#8888aa] leading-relaxed space-y-3">
                                <p>
                                    <strong className="text-white">RTNewsSumbar</strong> adalah portal berita daring yang berfokus pada pemberitaan wilayah Sumatera Barat dan sekitarnya. Kami hadir untuk memberikan informasi yang akurat, cepat, dan berimbang kepada masyarakat.
                                </p>
                                <p>
                                    Didirikan dengan semangat jurnalisme yang bertanggung jawab, RTNewsSumbar berkomitmen untuk menjadi rujukan utama berita lokal yang dipercaya oleh masyarakat Sumatera Barat.
                                </p>
                                <p>
                                    Kami menyajikan berita dari berbagai segmen: politik, ekonomi, sosial, budaya, olahraga, kesehatan, hingga teknologi — semua dalam satu platform yang mudah diakses.
                                </p>
                            </div>
                        </div>

                        {/* Visi Misi */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-7">
                            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <span className="w-1 h-5 rounded-full bg-[#e63946] inline-block"></span>
                                Visi &amp; Misi
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-sm font-bold text-[#e63946] uppercase tracking-wider mb-2">🎯 Visi</h3>
                                    <p className="text-sm text-[#8888aa] leading-relaxed">
                                        Menjadi portal berita terdepan dan terpercaya di Sumatera Barat yang mengedepankan nilai-nilai jurnalisme profesional dan bertanggung jawab.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#e63946] uppercase tracking-wider mb-2">🚀 Misi</h3>
                                    <ul className="text-sm text-[#8888aa] leading-relaxed space-y-1.5 list-none">
                                        {[
                                            'Menyajikan berita yang akurat, faktual, dan berimbang',
                                            'Mengutamakan kepentingan publik dalam setiap pemberitaan',
                                            'Membangun ekosistem informasi yang sehat di Sumatera Barat',
                                            'Mendukung perkembangan jurnalisme digital di daerah',
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-[#e63946] mt-0.5 shrink-0">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Struktur Redaksi */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-7">
                            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <span className="w-1 h-5 rounded-full bg-[#e63946] inline-block"></span>
                                Struktur Redaksi
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {team.map((member, i) => (
                                    <div key={i} className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl p-4 hover:border-[#e63946] transition-colors">
                                        <p className="text-[10px] font-bold text-[#e63946] uppercase tracking-widest mb-1">{member.role}</p>
                                        <p className="text-sm font-semibold text-white">{member.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Kontak */}
                    <div className="space-y-6">
                        {/* Kontak */}
                        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 pb-3 border-b border-[#2a2a3a]">
                                📬 Informasi Kontak
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-[#e63946] font-bold uppercase tracking-wider mb-1">Email Redaksi</p>
                                    <a
                                        href="mailto:rtnewssumbar@gmail.com"
                                        className="text-sm text-[#f0f0f5] hover:text-[#e63946] transition-colors break-all"
                                    >
                                        rtnewssumbar@gmail.com
                                    </a>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#e63946] font-bold uppercase tracking-wider mb-1">Alamat</p>
                                    <p className="text-sm text-[#8888aa] leading-relaxed">
                                        Sidodadi Jorong Limau Puruik,<br />
                                        Kec. Kinali, Kab. Pasaman Barat,<br />
                                        Sumatera Barat
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#e63946] font-bold uppercase tracking-wider mb-1">Website</p>
                                    <a
                                        href="https://rtnewssumbar.my.id"
                                        className="text-sm text-[#f0f0f5] hover:text-[#e63946] transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        rtnewssumbar.my.id
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Kode Etik */}
                        <div className="bg-[rgba(230,57,70,0.07)] border border-[rgba(230,57,70,0.25)] rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-[#e63946] uppercase tracking-wider mb-3">
                                ⚖️ Komitmen Kami
                            </h3>
                            <p className="text-xs text-[#8888aa] leading-relaxed">
                                RTNewsSumbar berkomitmen pada kode etik jurnalistik Indonesia dan menjunjung tinggi prinsip keberimbangan, akurasi, serta independensi dalam setiap karya jurnalistik yang kami hasilkan.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer kategoris={kategoris} />
        </div>
    );
}
