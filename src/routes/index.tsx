import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Wrench,
  Sparkles,
  Zap,
  Truck,
  Scissors,
  Laptop,
  MapPin,
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  Hourglass,
  PlayCircle,
  Search,
  Star,
  ShieldCheck,
  Building2,
  Briefcase,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Check,
  Store,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  jobsStore,
  useJobs,
  WORKERS,
  SERVICE_LABELS,
  type Job,
  type JobStatus,
  type ServiceType,
} from "@/lib/jobs-store";
import { VENDORS, LOCATIONS, type Vendor } from "@/lib/vendors-store";

export const Route = createFileRoute("/")({
  component: Index,
});

const SERVICES: { value: ServiceType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "kebersihan", label: "Kebersihan Rumah", icon: Sparkles },
  { value: "perbaikan", label: "Perbaikan Umum", icon: Wrench },
  { value: "listrik", label: "Instalasi Listrik", icon: Zap },
  { value: "pindahan", label: "Jasa Pindahan", icon: Truck },
  { value: "potong-rambut", label: "Potong Rambut", icon: Scissors },
  { value: "teknisi-it", label: "Teknisi IT", icon: Laptop },
];

function getServiceMeta(v: ServiceType) {
  return SERVICES.find((s) => s.value === v) || { value: v, label: v, icon: Wrench };
}

function statusBadge(s: JobStatus) {
  const map: Record<JobStatus, { label: string; className: string; Icon: typeof Hourglass }> = {
    menunggu: { label: "Menunggu", className: "bg-amber-100 text-amber-800 border-amber-200", Icon: Hourglass },
    diterima: { label: "Diterima", className: "bg-blue-100 text-blue-800 border-blue-200", Icon: CheckCircle2 },
    dikerjakan: { label: "Dikerjakan", className: "bg-purple-100 text-purple-800 border-purple-200", Icon: PlayCircle },
    selesai: { label: "Selesai", className: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  };
  const { label, className, Icon } = map[s];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Index() {
  const jobs = useJobs();

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Modal State
  const [selectedVendorForProfile, setSelectedVendorForProfile] = useState<Vendor | null>(null);
  const [selectedVendorForBooking, setSelectedVendorForBooking] = useState<Vendor | null>(null);

  // Form Booking State
  const [bookingForm, setBookingForm] = useState({
    customer: "",
    date: "",
    time: "",
    address: "",
    radius: 5,
    notes: "",
  });

  // Filtered Vendors calculation
  const filteredVendors = useMemo(() => {
    return VENDORS.filter((vendor) => {
      // Keyword Match
      const kw = searchKeyword.toLowerCase().trim();
      const matchKeyword =
        !kw ||
        vendor.name.toLowerCase().includes(kw) ||
        vendor.tagline.toLowerCase().includes(kw) ||
        vendor.description.toLowerCase().includes(kw) ||
        vendor.servicesOffered.some((s) => s.toLowerCase().includes(kw));

      // Category Match
      const matchCategory = selectedCategory === "all" || vendor.category === selectedCategory;

      // Location Match
      const matchLocation = selectedLocation === "all" || vendor.location === selectedLocation;

      return matchKeyword && matchCategory && matchLocation;
    });
  }, [searchKeyword, selectedCategory, selectedLocation]);

  // Reset Filters
  function resetFilters() {
    setSearchKeyword("");
    setSelectedCategory("all");
    setSelectedLocation("all");
  }

  // Handle Form Submission
  function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVendorForBooking) return;

    if (!bookingForm.customer || !bookingForm.date || !bookingForm.time || !bookingForm.address) {
      toast.error("Lengkapi semua kolom wajib (*)");
      return;
    }

    const job: Job = {
      id: jobsStore.nextId(),
      service: selectedVendorForBooking.category,
      date: bookingForm.date,
      time: bookingForm.time,
      address: bookingForm.address.trim().slice(0, 200),
      radius: Number(bookingForm.radius) || 5,
      notes: bookingForm.notes.trim().slice(0, 300),
      customer: bookingForm.customer.trim().slice(0, 80),
      status: "menunggu",
      vendorId: selectedVendorForBooking.id,
      vendorName: selectedVendorForBooking.name,
      createdAt: Date.now(),
    };

    jobsStore.add(job);
    toast.success(`Booking ${job.id} untuk ${selectedVendorForBooking.name} berhasil dibuat!`);

    // Reset and Close Modal
    setBookingForm({
      customer: "",
      date: "",
      time: "",
      address: "",
      radius: 5,
      notes: "",
    });
    setSelectedVendorForBooking(null);
  }

  // Queue categorizations
  const queue = useMemo(
    () => jobs.filter((j) => j.status === "menunggu").sort((a, b) => a.createdAt - b.createdAt),
    [jobs],
  );
  const active = useMemo(
    () => jobs.filter((j) => j.status === "diterima" || j.status === "dikerjakan"),
    [jobs],
  );
  const done = useMemo(() => jobs.filter((j) => j.status === "selesai"), [jobs]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <AppHeader />

      {/* Hero & Search Banner Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 via-background to-background py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 max-w-2xl">
            <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Jasa & Layanan Terpercaya
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cari Vendor & Layanan Jasa Terbaik di Kota Anda
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Temukan mitra profesional bersertifikat untuk kebersihan, perbaikan, instalasi listrik, pindahan, hingga servis IT dengan garansi resmi.
            </p>
          </div>

          {/* Search Bar & Filter Controls */}
          <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-12">
              {/* Keyword Search */}
              <div className="relative sm:col-span-5">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kata kunci (mis: AC, listrik, sofa, wifi)..."
                  className="pl-9"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              {/* Category Select */}
              <div className="sm:col-span-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2 truncate">
                      <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="Semua Kategori" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {SERVICES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <div className="flex items-center gap-2">
                          <s.icon className="h-4 w-4" />
                          {s.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Select */}
              <div className="sm:col-span-3">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="Semua Lokasi" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Lokasi</SelectItem>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filter Button */}
              <div className="sm:col-span-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full"
                  title="Reset Filter"
                  onClick={resetFilters}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Category Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t text-xs">
              <span className="text-muted-foreground font-medium mr-1">Kategori Populer:</span>
              <Button
                variant={selectedCategory === "all" ? "default" : "secondary"}
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => setSelectedCategory("all")}
              >
                Semua
              </Button>
              {SERVICES.map((s) => (
                <Button
                  key={s.value}
                  variant={selectedCategory === s.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs rounded-full gap-1"
                  onClick={() => setSelectedCategory(s.value)}
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Vendor List */}
          <div className="space-y-6 lg:col-span-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Daftar Vendor Penyedia Jasa</h2>
                <p className="text-xs text-muted-foreground">
                  Menampilkan {filteredVendors.length} dari {VENDORS.length} vendor terverifikasi
                </p>
              </div>
              {(selectedCategory !== "all" || selectedLocation !== "all" || searchKeyword) && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-primary">
                  Hapus Filter
                </Button>
              )}
            </div>

            {filteredVendors.length === 0 ? (
              <Card className="p-12 text-center">
                <Store className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-base font-semibold">Vendor Tidak Ditemukan</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba ubah kata kunci pencarian, kategori, atau lokasi wilayah Anda.
                </p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Lihat Semua Vendor
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredVendors.map((vendor) => {
                  const catMeta = getServiceMeta(vendor.category);
                  const Icon = catMeta.icon;
                  return (
                    <Card key={vendor.id} className="flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                          </div>
                          {vendor.verified && (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              <ShieldCheck className="mr-1 h-3 w-3" /> Terverifikasi
                            </Badge>
                          )}
                        </div>
                        <div className="pt-2">
                          <h3 className="font-semibold text-base leading-tight group-hover:text-primary">
                            {vendor.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{vendor.tagline}</p>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
                        <div className="flex items-center gap-3 pt-2 border-t">
                          <div className="flex items-center text-amber-600 font-semibold">
                            <Star className="mr-1 h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            {vendor.rating} <span className="text-muted-foreground font-normal ml-0.5">({vendor.reviewCount})</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-1 h-3.5 w-3.5 shrink-0" />
                            {vendor.location}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {vendor.badges.slice(0, 2).map((b) => (
                            <Badge key={b} variant="outline" className="text-[10px] py-0">
                              {b}
                            </Badge>
                          ))}
                        </div>

                        <div className="pt-1 text-xs">
                          <span className="text-muted-foreground">Mulai dari: </span>
                          <span className="font-bold text-primary">{formatIDR(vendor.startingPrice)}</span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setSelectedVendorForProfile(vendor)}
                        >
                          <Building2 className="mr-1.5 h-3.5 w-3.5" /> Company Profile
                        </Button>
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setSelectedVendorForBooking(vendor);
                          }}
                        >
                          Pesan Jasa <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Booking Queue */}
          <div className="space-y-6 lg:col-span-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Antrian Pesanan Saya</span>
                  <Badge variant="secondary">{jobs.length} Job</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Status pemesanan layanan harian Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="menunggu">
                  <TabsList className="grid w-full grid-cols-3 text-xs">
                    <TabsTrigger value="menunggu" className="text-xs">
                      Menunggu ({queue.length})
                    </TabsTrigger>
                    <TabsTrigger value="aktif" className="text-xs">
                      Aktif ({active.length})
                    </TabsTrigger>
                    <TabsTrigger value="selesai" className="text-xs">
                      Selesai ({done.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="menunggu" className="mt-4 space-y-3">
                    {queue.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Belum ada pesanan menunggu.
                      </p>
                    )}
                    {queue.map((j) => (
                      <JobMiniRow key={j.id} job={j} />
                    ))}
                  </TabsContent>

                  <TabsContent value="aktif" className="mt-4 space-y-3">
                    {active.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Tidak ada pekerjaan aktif saat ini.
                      </p>
                    )}
                    {active.map((j) => (
                      <JobMiniRow key={j.id} job={j} />
                    ))}
                  </TabsContent>

                  <TabsContent value="selesai" className="mt-4 space-y-3">
                    {done.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Belum ada riwayat pesanan selesai.
                      </p>
                    )}
                    {done.map((j) => (
                      <JobMiniRow key={j.id} job={j} />
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Guarantees Widget */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <ShieldCheck className="h-5 w-5" /> Jaminan Layanan ServisKu
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Vendor & Teknisi Terverifikasi Resmi</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Harga Transparan Tanpa Biaya Tersembunyi</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Garansi Purna Jual & Layanan Ulang Gratis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* MODAL 1: Vendor Company Profile */}
      <Dialog
        open={!!selectedVendorForProfile}
        onOpenChange={(open) => !open && setSelectedVendorForProfile(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedVendorForProfile && (
            <div>
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-none">
                      {SERVICE_LABELS[selectedVendorForProfile.category]}
                    </Badge>
                    <h2 className="text-2xl font-bold">{selectedVendorForProfile.name}</h2>
                    <p className="text-sm opacity-90 mt-1">{selectedVendorForProfile.tagline}</p>
                  </div>
                  {selectedVendorForProfile.verified && (
                    <Badge className="bg-emerald-500 text-white border-none shrink-0 gap-1">
                      <ShieldCheck className="h-4 w-4" /> Verified Partner
                    </Badge>
                  )}
                </div>
              </div>

              {/* Profile Body */}
              <div className="p-6 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b pb-5">
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="flex items-center justify-center text-amber-500 font-bold">
                      <Star className="mr-1 h-4 w-4 fill-amber-500" />
                      {selectedVendorForProfile.rating}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{selectedVendorForProfile.reviewCount} Ulasan</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="font-bold text-foreground">{selectedVendorForProfile.experienceYears} Tahun</div>
                    <span className="text-[11px] text-muted-foreground">Pengalaman</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="font-bold text-primary">{formatIDR(selectedVendorForProfile.startingPrice)}</div>
                    <span className="text-[11px] text-muted-foreground">Mulai Dari</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="font-bold text-foreground truncate">{selectedVendorForProfile.location}</div>
                    <span className="text-[11px] text-muted-foreground">Area Utama</span>
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Profil Perusahaan
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedVendorForProfile.description}
                  </p>
                </div>

                {/* Services Offered */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> Layanan Spesialisasi
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedVendorForProfile.servicesOffered.map((service, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm border p-2.5 rounded-md bg-card">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address & Operating Hours */}
                <div className="grid sm:grid-cols-2 gap-4 border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground block">Alamat Kantor / Workshop:</span>
                      {selectedVendorForProfile.address}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground block">Jam Operasional:</span>
                      {selectedVendorForProfile.operatingHours}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="border-t p-4 bg-muted/30 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Mulai dari</span>
                  <span className="text-lg font-bold text-primary">{formatIDR(selectedVendorForProfile.startingPrice)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedVendorForProfile(null)}>
                    Tutup
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedVendorForBooking(selectedVendorForProfile);
                      setSelectedVendorForProfile(null);
                    }}
                  >
                    Pesan Layanan Sekarang <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Form Booking */}
      <Dialog
        open={!!selectedVendorForBooking}
        onOpenChange={(open) => !open && setSelectedVendorForBooking(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Form Booking Pemesanan
            </DialogTitle>
            <DialogDescription>
              Isi formulir berikut untuk memesan layanan dari vendor terpilih.
            </DialogDescription>
          </DialogHeader>

          {selectedVendorForBooking && (
            <div className="mb-2 rounded-lg border bg-primary/5 p-3 text-xs">
              <div className="font-semibold text-primary">{selectedVendorForBooking.name}</div>
              <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{SERVICE_LABELS[selectedVendorForBooking.category]}</span> •
                <span>{selectedVendorForBooking.location}</span>
              </div>
            </div>
          )}

          <form onSubmit={submitBooking} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Pemesan *</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Masukkan nama lengkap Anda"
                  value={bookingForm.customer}
                  maxLength={80}
                  onChange={(e) => setBookingForm({ ...bookingForm, customer: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tanggal Layanan *</Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9 text-xs"
                    value={bookingForm.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Jam Pelaksanaan *</Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="pl-9 text-xs"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Alamat Lengkap Lokasi *</Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  className="min-h-16 pl-9 text-xs"
                  placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                  value={bookingForm.address}
                  maxLength={200}
                  onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <Label className="text-xs">Radius Jarak (km)</Label>
                <span className="font-semibold text-primary">{bookingForm.radius} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={bookingForm.radius}
                onChange={(e) => setBookingForm({ ...bookingForm, radius: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 km</span>
                <span>30 km</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Catatan Tambahan (Opsional)</Label>
              <Textarea
                className="text-xs"
                placeholder="Misal: Patokan lokasi, detail masalah yang perlu dikerjakan"
                value={bookingForm.notes}
                maxLength={300}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedVendorForBooking(null)}
              >
                Batal
              </Button>
              <Button type="submit">Kirim Booking</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function JobMiniRow({ job }: { job: Job }) {
  const meta = getServiceMeta(job.service);
  const Icon = meta.icon;
  return (
    <div className="rounded-lg border bg-card p-3 text-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold">{meta.label}</div>
            <div className="text-[11px] text-muted-foreground">#{job.id}</div>
          </div>
        </div>
        {statusBadge(job.status)}
      </div>

      {job.vendorName && (
        <div className="flex items-center gap-1 text-[11px] text-primary font-medium bg-primary/5 p-1.5 rounded">
          <Store className="h-3 w-3 shrink-0" />
          <span className="truncate">{job.vendorName}</span>
        </div>
      )}

      <div className="space-y-0.5 text-muted-foreground text-[11px]">
        <div>Pemesan: <span className="text-foreground font-medium">{job.customer}</span></div>
        <div>Waktu: {job.date} • {job.time}</div>
        <div className="truncate">Lokasi: {job.address}</div>
      </div>
    </div>
  );
}
