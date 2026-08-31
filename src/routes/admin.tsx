import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Timer,
  TrendingUp,
  Users,
  Hourglass,
  PlayCircle,
} from "lucide-react";
import { useJobs, WORKERS, SERVICE_LABELS, type JobStatus } from "@/lib/jobs-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard Admin — ServisKu" },
      { name: "description", content: "Statistik booking, performa pekerja, dan riwayat antrian pekerjaan." },
      { property: "og:title", content: "Dashboard Admin — ServisKu" },
      { property: "og:description", content: "Pantau performa layanan dan pekerja." },
    ],
  }),
  component: AdminDashboard,
});

const CHART_COLORS = [
  "oklch(0.55 0.19 265)",
  "oklch(0.65 0.18 165)",
  "oklch(0.7 0.17 60)",
  "oklch(0.65 0.22 25)",
  "oklch(0.6 0.2 305)",
  "oklch(0.65 0.16 200)",
];

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

function formatDuration(ms: number) {
  if (!isFinite(ms) || ms <= 0) return "-";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}h ${h % 24}j`;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

function AdminDashboard() {
  const jobs = useJobs();

  const stats = useMemo(() => {
    const total = jobs.length;
    const menunggu = jobs.filter((j) => j.status === "menunggu").length;
    const aktif = jobs.filter((j) => j.status === "diterima" || j.status === "dikerjakan").length;
    const selesai = jobs.filter((j) => j.status === "selesai").length;
    const completionRate = total ? Math.round((selesai / total) * 100) : 0;
    const completed = jobs.filter((j) => j.status === "selesai" && j.completedAt && j.createdAt);
    const avgTurnaround =
      completed.length > 0
        ? completed.reduce((sum, j) => sum + (j.completedAt! - j.createdAt), 0) / completed.length
        : 0;
    return { total, menunggu, aktif, selesai, completionRate, avgTurnaround };
  }, [jobs]);

  const serviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const j of jobs) counts[j.service] = (counts[j.service] || 0) + 1;
    return Object.entries(counts).map(([k, v]) => ({
      name: SERVICE_LABELS[k as keyof typeof SERVICE_LABELS],
      value: v,
    }));
  }, [jobs]);

  const workerPerf = useMemo(() => {
    return WORKERS.map((w) => {
      const assigned = jobs.filter((j) => j.worker === w);
      const selesai = assigned.filter((j) => j.status === "selesai");
      const avgMs =
        selesai.length > 0
          ? selesai.reduce((s, j) => s + ((j.completedAt || 0) - (j.acceptedAt || j.createdAt)), 0) /
            selesai.length
          : 0;
      return {
        name: w,
        total: assigned.length,
        selesai: selesai.length,
        aktif: assigned.filter((j) => j.status === "diterima" || j.status === "dikerjakan").length,
        rate: assigned.length ? Math.round((selesai.length / assigned.length) * 100) : 0,
        avgMs,
      };
    }).sort((a, b) => b.selesai - a.selesai);
  }, [jobs]);

  const trend = useMemo(() => {
    const days: { date: string; label: string; masuk: number; selesai: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        masuk: 0,
        selesai: 0,
      });
    }
    for (const j of jobs) {
      const created = new Date(j.createdAt).toISOString().slice(0, 10);
      const day = days.find((d) => d.date === created);
      if (day) day.masuk++;
      if (j.completedAt) {
        const done = new Date(j.completedAt).toISOString().slice(0, 10);
        const day2 = days.find((d) => d.date === done);
        if (day2) day2.selesai++;
      }
    }
    return days;
  }, [jobs]);

  const history = useMemo(() => [...jobs].sort((a, b) => b.createdAt - a.createdAt), [jobs]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>
          <p className="text-sm text-muted-foreground">
            Statistik booking, performa pekerja, dan riwayat antrian.
          </p>
        </section>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Booking" value={stats.total} Icon={ClipboardList} />
          <StatCard label="Menunggu" value={stats.menunggu} Icon={Hourglass} tint="amber" />
          <StatCard label="Sedang Aktif" value={stats.aktif} Icon={PlayCircle} tint="purple" />
          <StatCard
            label="Tingkat Selesai"
            value={`${stats.completionRate}%`}
            Icon={TrendingUp}
            tint="emerald"
            sub={`Rata-rata ${formatDuration(stats.avgTurnaround)}`}
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tren 7 Hari</CardTitle>
              <CardDescription>Booking masuk vs pekerjaan selesai</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="masuk" stroke={CHART_COLORS[0]} strokeWidth={2} name="Masuk" />
                  <Line type="monotone" dataKey="selesai" stroke={CHART_COLORS[1]} strokeWidth={2} name="Selesai" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jenis Layanan</CardTitle>
              <CardDescription>Distribusi permintaan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {serviceData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {serviceData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Worker performance */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Performa Pekerja
            </CardTitle>
            <CardDescription>Ringkasan penugasan dan penyelesaian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={workerPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="selesai" fill={CHART_COLORS[1]} name="Selesai" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aktif" fill={CHART_COLORS[0]} name="Aktif" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pekerja</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Selesai</TableHead>
                      <TableHead className="text-right">Rasio</TableHead>
                      <TableHead className="text-right">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workerPerf.map((w) => (
                      <TableRow key={w.name}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell className="text-right">{w.total}</TableCell>
                        <TableCell className="text-right">{w.selesai}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {w.rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          <Timer className="mr-1 inline h-3 w-3" />
                          {formatDuration(w.avgMs)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Riwayat Antrian
            </CardTitle>
            <CardDescription>Semua pekerjaan, terbaru di atas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Pemesan</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Pekerja</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Durasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-mono text-xs">{j.id}</TableCell>
                      <TableCell>{SERVICE_LABELS[j.service]}</TableCell>
                      <TableCell>{j.customer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {j.date} {j.time}
                      </TableCell>
                      <TableCell className="text-sm">{j.worker || "—"}</TableCell>
                      <TableCell>{statusBadge(j.status)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {j.completedAt
                          ? formatDuration(j.completedAt - j.createdAt)
                          : j.status === "menunggu"
                            ? formatDuration(Date.now() - j.createdAt)
                            : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        Belum ada riwayat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  sub,
  tint = "primary",
}: {
  label: string;
  value: string | number;
  Icon: typeof ClipboardList;
  sub?: string;
  tint?: "primary" | "amber" | "purple" | "emerald";
}) {
  const tintMap = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tintMap[tint]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
