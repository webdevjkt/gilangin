import { useSyncExternalStore } from "react";

export type ServiceType =
  | "kebersihan"
  | "perbaikan"
  | "listrik"
  | "pindahan"
  | "potong-rambut"
  | "teknisi-it";

export type JobStatus = "menunggu" | "diterima" | "dikerjakan" | "selesai";

export interface Job {
  id: string;
  service: ServiceType;
  date: string;
  time: string;
  address: string;
  radius: number;
  notes: string;
  customer: string;
  status: JobStatus;
  worker?: string;
  vendorId?: string;
  vendorName?: string;
  createdAt: number;
  acceptedAt?: number;
  startedAt?: number;
  completedAt?: number;
}

export const WORKERS = ["Budi S.", "Andi R.", "Siti M.", "Rudi H.", "Dewi A."];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  kebersihan: "Kebersihan Rumah",
  perbaikan: "Perbaikan Umum",
  listrik: "Instalasi Listrik",
  pindahan: "Jasa Pindahan",
  "potong-rambut": "Potong Rambut",
  "teknisi-it": "Teknisi IT",
};

const now = Date.now();

let jobs: Job[] = [
  {
    id: "JOB-001",
    service: "kebersihan",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    address: "Jl. Melati No. 12, Jakarta Selatan",
    radius: 5,
    notes: "Rumah 2 lantai",
    customer: "Ibu Rina",
    status: "menunggu",
    createdAt: now - 60000,
  },
  {
    id: "JOB-002",
    service: "listrik",
    date: new Date().toISOString().slice(0, 10),
    time: "13:30",
    address: "Jl. Kenanga No. 4, Jakarta Timur",
    radius: 10,
    notes: "Ganti stop kontak",
    customer: "Pak Joko",
    status: "diterima",
    worker: "Andi R.",
    createdAt: now - 30000,
    acceptedAt: now - 20000,
  },
  {
    id: "JOB-003",
    service: "perbaikan",
    date: new Date(now - 86400000).toISOString().slice(0, 10),
    time: "10:00",
    address: "Jl. Mawar No. 7, Jakarta Pusat",
    radius: 8,
    notes: "Bocor pipa dapur",
    customer: "Bpk. Hendra",
    status: "selesai",
    worker: "Budi S.",
    createdAt: now - 90000000,
    acceptedAt: now - 89000000,
    startedAt: now - 88000000,
    completedAt: now - 86400000,
  },
  {
    id: "JOB-004",
    service: "pindahan",
    date: new Date(now - 172800000).toISOString().slice(0, 10),
    time: "08:00",
    address: "Jl. Anggrek No. 22, Depok",
    radius: 15,
    notes: "Pindah apartemen",
    customer: "Ibu Maya",
    status: "selesai",
    worker: "Rudi H.",
    createdAt: now - 180000000,
    acceptedAt: now - 179000000,
    startedAt: now - 178000000,
    completedAt: now - 172800000,
  },
  {
    id: "JOB-005",
    service: "teknisi-it",
    date: new Date(now - 259200000).toISOString().slice(0, 10),
    time: "14:00",
    address: "Jl. Cempaka No. 3, Bekasi",
    radius: 12,
    notes: "Setup jaringan kantor",
    customer: "PT Sinar",
    status: "selesai",
    worker: "Siti M.",
    createdAt: now - 270000000,
    acceptedAt: now - 269000000,
    startedAt: now - 268000000,
    completedAt: now - 259200000,
  },
  {
    id: "JOB-006",
    service: "potong-rambut",
    date: new Date(now - 345600000).toISOString().slice(0, 10),
    time: "16:00",
    address: "Jl. Dahlia No. 9, Tangerang",
    radius: 6,
    notes: "",
    customer: "Bpk. Iwan",
    status: "selesai",
    worker: "Dewi A.",
    createdAt: now - 350000000,
    acceptedAt: now - 349000000,
    startedAt: now - 348000000,
    completedAt: now - 345600000,
  },
  {
    id: "JOB-007",
    service: "kebersihan",
    date: new Date(now - 86400000).toISOString().slice(0, 10),
    time: "11:00",
    address: "Jl. Flamboyan No. 5, Jakarta Barat",
    radius: 7,
    notes: "",
    customer: "Ibu Lestari",
    status: "selesai",
    worker: "Andi R.",
    createdAt: now - 95000000,
    acceptedAt: now - 94000000,
    startedAt: now - 93000000,
    completedAt: now - 86400000,
  },
];

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const jobsStore = {
  get: () => jobs,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  add: (job: Job) => {
    jobs = [job, ...jobs];
    emit();
  },
  assign: (id: string, worker: string) => {
    jobs = jobs.map((j) =>
      j.id === id ? { ...j, worker, status: "diterima", acceptedAt: Date.now() } : j,
    );
    emit();
  },
  advance: (id: string) => {
    jobs = jobs.map((j) => {
      if (j.id !== id) return j;
      if (j.status === "diterima") return { ...j, status: "dikerjakan", startedAt: Date.now() };
      if (j.status === "dikerjakan") return { ...j, status: "selesai", completedAt: Date.now() };
      return j;
    });
    emit();
  },
  nextId: () => `JOB-${String(jobs.length + 1).padStart(3, "0")}`,
};

export function useJobs() {
  return useSyncExternalStore(jobsStore.subscribe, jobsStore.get, jobsStore.get);
}
