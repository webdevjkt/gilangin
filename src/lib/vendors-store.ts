import { type ServiceType } from "./jobs-store";

export interface Vendor {
  id: string;
  name: string;
  tagline: string;
  category: ServiceType;
  location: string;
  address: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  verified: boolean;
  experienceYears: number;
  operatingHours: string;
  description: string;
  servicesOffered: string[];
  badges: string[];
}

export const LOCATIONS = [
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bogor",
  "Depok",
  "Tangerang",
  "Tangerang Selatan",
  "Bekasi",
] as const;

export type LocationType = (typeof LOCATIONS)[number];

export const VENDORS: Vendor[] = [
  {
    id: "VND-001",
    name: "CleanHome Premium Express",
    tagline: "Layanan Kebersihan Rumah & Kantor Standar Hotel Bintang 5",
    category: "kebersihan",
    location: "Jakarta Selatan",
    address: "Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan",
    rating: 4.9,
    reviewCount: 142,
    startingPrice: 75000,
    verified: true,
    experienceYears: 6,
    operatingHours: "07:00 - 20:00 WIB",
    description:
      "CleanHome Premium Express menyediakan jasa pembersihan mendalam (deep cleaning) profesional untuk kediaman, apartemen, dan ruang kantor. Menggunakan peralatan disinfektan ramah lingkungan dan tim terlatih bersertifikasi.",
    servicesOffered: [
      "Deep Cleaning Kamar & Toilet",
      "Cuci Sofa & Kasur Hydro-Cleaning",
      "Pembersihan Pasca Renovasi",
      "Pembersihan Karpet & Gorden",
    ],
    badges: ["Top Rated", "Peralatan Ramah Lingkungan", "Garansi Bersih"],
  },
  {
    id: "VND-002",
    name: "TeknikJaya Solusindo",
    tagline: "Spesialis Perbaikan & Perawatan Rumah Terpercaya",
    category: "perbaikan",
    location: "Jakarta Pusat",
    address: "Jl. Kebon Sirih No. 12, Menteng, Jakarta Pusat",
    rating: 4.8,
    reviewCount: 98,
    startingPrice: 100000,
    verified: true,
    experienceYears: 8,
    operatingHours: "08:00 - 18:00 WIB",
    description:
      "TeknikJaya Solusindo hadir untuk mengatasi semua masalah perbaikan rumah mulai dari kebocoran atap, servis pompa air, perbaikan pintu/jendela, hingga perbaikan keramik dan pengecatan tembok.",
    servicesOffered: [
      "Perbaikan Kebocoran Pipa & Atap",
      "Pemasangan & Servis Pompa Air",
      "Pengecatan & Touch-up Tembok",
      "Perbaikan Furnitur & Pintu Woodwork",
    ],
    badges: ["Teknisi Bersertifikat", "Respon Cepat", "Garansi 30 Hari"],
  },
  {
    id: "VND-003",
    name: "ElectroMaster Nusantara",
    tagline: "Ahli Instalasi & Pemeliharaan Listrik Aman Berstandar PLN",
    category: "listrik",
    location: "Depok",
    address: "Jl. Margonda Raya No. 110, Beji, Depok",
    rating: 4.9,
    reviewCount: 175,
    startingPrice: 120000,
    verified: true,
    experienceYears: 10,
    operatingHours: "24 Jam (Emergency Ready)",
    description:
      "ElectroMaster Nusantara melayani perbaikan konsleting listrik emergency, peremajaan kabel daya, pemasangan panel breaker, hingga instalasi titik lampu & sakelar dengan standar keselamatan tinggi.",
    servicesOffered: [
      "Perbaikan Korsleting Listrik",
      "Pasang / Pindah Panel Listrik & Breaker",
      "Instalasi Stop Kontak & Lampu LED",
      "Pemeriksaan Kelayakan Grounding",
    ],
    badges: ["Darurat 24/7", "Standar SNI & PLN", "Asuransi Keamanan"],
  },
  {
    id: "VND-004",
    name: "ExpressMove Cargo & Relocation",
    tagline: "Jasa Pindahan Rumah, Kost & Kantor Cepat Tanpa Repot",
    category: "pindahan",
    location: "Jakarta Timur",
    address: "Jl. Raya Pemuda No. 88, Rawamangun, Jakarta Timur",
    rating: 4.7,
    reviewCount: 86,
    startingPrice: 350000,
    verified: true,
    experienceYears: 5,
    operatingHours: "06:00 - 21:00 WIB",
    description:
      "ExpressMove Cargo memberikan kemudahan pindahan lengkap dengan armada truk/pickup, tim pengemas (packing specialist), kardus pelindung bubble wrap, serta bongkar-pasang perabotan.",
    servicesOffered: [
      "Pindahan Rumah & Apartemen Full Service",
      "Pindahan Kost & Barang Antar Kota",
      "Jasa Packing & Bubble Wrapping Extra Safe",
      "Bongkar Pasang Lemari & Tempat Tidur",
    ],
    badges: ["Armada Milik Sendiri", "Gratis Bubble Wrap", "Tepat Waktu"],
  },
  {
    id: "VND-005",
    name: "BarberBox Home Service",
    tagline: "Potong Rambut & Grooming Pria Langsung ke Rumah Anda",
    category: "potong-rambut",
    location: "Jakarta Selatan",
    address: "Jl. Kemang Raya No. 24, Jakarta Selatan",
    rating: 4.9,
    reviewCount: 210,
    startingPrice: 85000,
    verified: true,
    experienceYears: 4,
    operatingHours: "09:00 - 21:00 WIB",
    description:
      "BarberBox membawa pengalaman barber shop eksklusif langsung ke pintu rumah Anda. Steril, rapi, santai tanpa antri dengan hair stylist profesional berpengalaman.",
    servicesOffered: [
      "Gentlemen Haircut & Styling",
      "Kids Grooming Haircut",
      "Beard Trim & Hot Towel Shave",
      "Hair Color & Blackening Therapy",
    ],
    badges: ["Alat 100% Steril", "Stylist Hits", "Hygiene First"],
  },
  {
    id: "VND-006",
    name: "IT-Fix Solusindo & Network",
    tagline: "Solusi Komputer, Laptop, Wi-Fi & CCTV On-Site",
    category: "teknisi-it",
    location: "Tangerang",
    address: "Jl. BSD Green Office Park No. 7, BSD City, Tangerang",
    rating: 4.8,
    reviewCount: 114,
    startingPrice: 150000,
    verified: true,
    experienceYears: 7,
    operatingHours: "08:30 - 19:30 WIB",
    description:
      "IT-Fix Solusindo melayani perbaikan hardware/software laptop dan PC, instalasi ulang OS, pemasangan jaringan Wi-Fi/Mikrotik, hingga instalasi sistem CCTV rumahan & kantor.",
    servicesOffered: [
      "Servis Laptop Mati Total / Overheat",
      "Upgrade SSD & RAM PC/MacBook",
      "Instalasi Mikrotik, Router & Wi-Fi Extender",
      "Pasang Paket CCTV 4-8 Kamera",
    ],
    badges: ["No Fix No Fee", "Suku Cadang Original", "Konsultasi Gratis"],
  },
  {
    id: "VND-007",
    name: "KlinikResik Home Care",
    tagline: "Jasa Kebersihan Disinfeksi & Cuci Kasur Terbaik",
    category: "kebersihan",
    location: "Bekasi",
    address: "Jl. Ahmad Yani No. 5, Bekasi Barat",
    rating: 4.7,
    reviewCount: 65,
    startingPrice: 70000,
    verified: true,
    experienceYears: 3,
    operatingHours: "07:30 - 19:00 WIB",
    description:
      "KlinikResik khusus melayani warga Bekasi dan sekitarnya untuk penyemprotan desinfektan, pembersihan tungau UV-C, dan penyedotan debu alergen pada springbed.",
    servicesOffered: [
      "Vakum Tungau UV-C Mattress",
      "Fogging Disinfeksi Ruangan",
      "Cuci Stroller & Car Seat Baby",
    ],
    badges: ["Bebas Tungau", "Ramah Anak", "Penyedot UV-C"],
  },
  {
    id: "VND-008",
    name: "ServisListrik Kilat Jakarta",
    tagline: "Penanganan Kilat Masalah Kelistrikan & Pasang Stop Kontak",
    category: "listrik",
    location: "Jakarta Barat",
    address: "Jl. Kebon Jeruk Raya No. 19, Jakarta Barat",
    rating: 4.8,
    reviewCount: 92,
    startingPrice: 110000,
    verified: true,
    experienceYears: 9,
    operatingHours: "07:00 - 22:00 WIB",
    description:
      "Mitra teknisi berpengalaman untuk pemasangan instalasi listrik rumah baru, penambahan instalasi AC/Water Heater, serta perbaikan sekering jebol.",
    servicesOffered: [
      "Jalur Kabel AC & Water Heater",
      "Perbaikan Sekering & Saklar Toko",
      "Pemasangan Lampu Gantung & Chandelier",
    ],
    badges: ["Teknisi Handal", "Harga Transparan", "Jaminan Aman"],
  },
];
