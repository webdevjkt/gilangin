/**
 * Gilangin - Local Data & State Management
 * Focused on 3 Core Service Groups: Otomotif & Detailing, Jasa Kebersihan, and Jasa Pindahan.
 * Admin can freely CRUD more groups and services anytime.
 */

// Initial 3 Core Service Groups
const DEFAULT_SERVICE_GROUPS = [
  {
    id: "otomotif",
    name: "Otomotif & Detailing",
    icon: "fa-car",
    color: "#f43f5e",
    description: "Perawatan & salon kendaraan datang ke rumah: nano ceramic coating, detailing jamur kaca & interior cuci bersih.",
    isActive: true,
    sortOrder: 1
  },
  {
    id: "kebersihan",
    name: "Jasa Kebersihan (Cleaning)",
    icon: "fa-broom",
    color: "#0284c7",
    description: "Layanan hydro-cleaning kasur, sofa, cuci karpet, basmi tungau & deep cleaning kamar mandi/rumah.",
    isActive: true,
    sortOrder: 2
  },
  {
    id: "pindahan",
    name: "Jasa Pindahan & Angkut",
    icon: "fa-truck",
    color: "#10b981",
    description: "Layanan relokasi rumah, kost, kantor & apartemen se-Jabodetabek dengan armada prima dan tim angkut.",
    isActive: true,
    sortOrder: 3
  }
];

// Initial Service Items under the 3 Groups
const DEFAULT_SERVICE_ITEMS = [
  // 1. Otomotif & Detailing
  {
    id: "oto-coating",
    groupId: "otomotif",
    name: "Nano Ceramic Coating Mobil",
    price: 450000,
    estimatedDuration: "3 - 4 Jam",
    warranty: "Garansi Kilap 90 Hari",
    description: "Proteksi cat bodi mobil 3 lapis nano ceramic anti baret halus dan efek daun talas tahan lama.",
    features: ["Hydrophobic Coating 3 Layer", "Termasuk Polish Baret Halus", "Bisa Dikerjakan di Garasi Rumah"],
    isActive: true,
    sortOrder: 1
  },
  {
    id: "oto-kaca",
    groupId: "otomotif",
    name: "Pembersihan Jamur Kaca & Detailing",
    price: 175000,
    estimatedDuration: "1 - 2 Jam",
    warranty: "Garansi Kaca Bening",
    description: "Membersihkan kerak air membandel dan jamur di seluruh kaca mobil serta spion agar pandangan jernih.",
    features: ["Obat Jamur Aman Kaca Eropa", "Termasuk Kaca Depan, Samping & Belakang", "Water Repellent Coating"],
    isActive: true,
    sortOrder: 2
  },
  {
    id: "oto-cuci",
    groupId: "otomotif",
    name: "Cuci Mobil Premium & Interior Deep Clean",
    price: 95000,
    estimatedDuration: "1 - 1.5 Jam",
    warranty: "Jaminan Bersih Wangi",
    description: "Cuci salju bodi eksterior, pembersihan debu kolong mesin, vakum karpet interior dan semprot aroma segar.",
    features: ["Shampoo pH Netral", "Vakum Jok & Karpet Dasar", "Semir Ban Mengkilap"],
    isActive: true,
    sortOrder: 3
  },

  // 2. Jasa Kebersihan (Cleaning)
  {
    id: "cl-kasur",
    groupId: "kebersihan",
    name: "Hydro-Cleaning Kasur & Sofa (Anti Tungau)",
    price: 85000,
    estimatedDuration: "1 - 2 Jam",
    warranty: "Garansi Higienis Bebas Tungau",
    description: "Sedot debu dan tungau kasur/sofa menggunakan mesin hydro-vacuum berteknologi separator air.",
    features: ["Sedot Tungau Hingga 20cm", "Chemical Aromaterapi Alami", "Hasil Kering 90%"],
    isActive: true,
    sortOrder: 1
  },
  {
    id: "cl-toilet",
    groupId: "kebersihan",
    name: "Deep Cleaning Kamar Mandi Berkerak",
    price: 130000,
    estimatedDuration: "1.5 - 3 Jam",
    warranty: "Garansi Kerak Bersih",
    description: "Pembersihan kerak air membandel pada lantai keramik, kloset, dinding kamar mandi dan kaca shower.",
    features: ["Cairan Pembersih Khusus Kerak", "Penyikatan Detail Sudut", "Disinfeksi Bebas Kuman"],
    isActive: true,
    sortOrder: 2
  },
  {
    id: "cl-general",
    groupId: "kebersihan",
    name: "General Deep Cleaning Rumah / Kost",
    price: 150000,
    estimatedDuration: "2 - 4 Jam",
    warranty: "Garansi Bersih Rapi",
    description: "Pembersihan menyeluruh lantai, jendela, kusen, debu langit-langit dan sanitasi ruangan.",
    features: ["Peralatan Cleaning Lengkap", "Chemical Ramah Lingkungan", "Tenaga Cleaner Terlatih"],
    isActive: true,
    sortOrder: 3
  },

  // 3. Jasa Pindahan & Angkut
  {
    id: "pd-pickup",
    groupId: "pindahan",
    name: "Pindahan Rumah / Kost (Mobil Pickup + Tim)",
    price: 250000,
    estimatedDuration: "Fleksibel",
    warranty: "Jaminan Barang Aman",
    description: "Sewa mobil pickup bak/box termasuk driver dan tenaga angkut untuk pindahan rumah atau kost se-Jabodetabek.",
    features: ["Mobil Pickup Prima", "Termasuk 1 Driver + 1 Helper", "Tali & Terpal Pelindung Hujan"],
    isActive: true,
    sortOrder: 1
  },
  {
    id: "pd-truk",
    groupId: "pindahan",
    name: "Pindahan Besar Apartemen / Kantor (Truk Engkel)",
    price: 450000,
    estimatedDuration: "Fleksibel",
    warranty: "Jaminan Muatan Rapi",
    description: "Armada truk engkel box kapasitas besar cocok untuk pindahan furniture besar, perkantoran & apartemen.",
    features: ["Kapasitas Muat Ekstra Besar", "Termasuk Driver + 2 Tenaga Angkut", "Penataan Muatan Rapi & Aman"],
    isActive: true,
    sortOrder: 2
  },
  {
    id: "pd-helper",
    groupId: "pindahan",
    name: "Jasa Tenaga Angkut / Helper Saja",
    price: 100000,
    estimatedDuration: "Per Sesi",
    warranty: "Tenaga Berpengalaman",
    description: "Jasa tenaga bantuan untuk angkat barang berat, bongkar muat furniture, atau penataan ulang barang rumah.",
    features: ["Tenaga Fisik Kuat & Sigap", "Handling Barang Rapuh Hati-hati", "Fleksibel Sesuai Kebutuhan"],
    isActive: true,
    sortOrder: 3
  }
];

// Initial Service Jobs
const DEFAULT_JOBS = [
  {
    id: "JOB-101",
    service: "oto-coating",
    serviceGroup: "otomotif",
    serviceName: "Otomotif: Nano Ceramic Coating Mobil + Pembersihan Jamur Kaca",
    items: [
      { id: "oto-coating", groupId: "otomotif", groupName: "Otomotif & Detailing", name: "Nano Ceramic Coating Mobil", price: 450000 },
      { id: "oto-kaca", groupId: "otomotif", groupName: "Otomotif & Detailing", name: "Pembersihan Jamur Kaca & Detailing", price: 175000 }
    ],
    totalPrice: 625000,
    customer: "Bpk. Wahyu Hermawan",
    phone: "081288990011",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    address: "Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan",
    radius: 5,
    notes: "Mobil Pajero Sport hitam, mohon bawa peralatan lengkap pengerjaan di garasi.",
    status: "menunggu",
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: "JOB-102",
    service: "cl-kasur",
    serviceGroup: "kebersihan",
    serviceName: "Kebersihan: Hydro-Cleaning Kasur & Sofa",
    items: [
      { id: "cl-kasur", groupId: "kebersihan", groupName: "Jasa Kebersihan (Cleaning)", name: "Hydro-Cleaning Kasur & Sofa (Anti Tungau)", price: 85000 }
    ],
    totalPrice: 85000,
    customer: "Ibu Jessica Tan",
    phone: "081377889900",
    date: new Date().toISOString().slice(0, 10),
    time: "13:30",
    address: "Jl. Menteng Raya No. 18, Jakarta Pusat",
    radius: 8,
    notes: "Sedot debu dan tungau untuk 2 kasur king size.",
    status: "diterima",
    worker: "Budi Santoso",
    createdAt: Date.now() - 3600000 * 2,
    acceptedAt: Date.now() - 3600000 * 1,
  }
];

// Available Internal Workers
const WORKERS = ["Budi Santoso", "Andi Saputra", "Siti Rahma", "Rudi Hermawan", "Dewi Lestari", "Agus Setiawan"];

// Supported Locations (Jabodetabek)
const LOCATIONS = [
  "Semua Lokasi (Jabodetabek)",
  "Jakarta Selatan",
  "Jakarta Pusat",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bogor",
  "Depok",
  "Tangerang",
  "Tangerang Selatan",
  "Bekasi"
];

// Storage Helper with Supabase Cloud Sync
const Storage = {
  // ─── SERVICE GROUPS CRUD ─────────────────────────────────────
  getServiceGroups() {
    const data = localStorage.getItem("GILANGIN_GROUPS_V2");
    if (data) {
      try { return JSON.parse(data); } catch (e) {}
    }
    localStorage.setItem("GILANGIN_GROUPS_V2", JSON.stringify(DEFAULT_SERVICE_GROUPS));
    return DEFAULT_SERVICE_GROUPS;
  },

  saveServiceGroups(groups) {
    localStorage.setItem("GILANGIN_GROUPS_V2", JSON.stringify(groups));
  },

  addServiceGroup(group) {
    const groups = this.getServiceGroups();
    if (!group.id) {
      group.id = (group.name || "grup").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    const updated = [group, ...groups.filter(g => g.id !== group.id)];
    this.saveServiceGroups(updated);

    if (window.supabaseClient) {
      window.supabaseClient.from('service_groups').upsert([{
        id: group.id,
        name: group.name,
        icon: group.icon || "fa-wrench",
        color: group.color || "#3b82f6",
        description: group.description || "",
        is_active: group.isActive !== false,
        sort_order: Number(group.sortOrder || 0)
      }]).then(({ error }) => {
        if (error) console.warn('Supabase group insert warning:', error);
      });
    }

    return group;
  },

  updateServiceGroup(id, updates) {
    const groups = this.getServiceGroups();
    const index = groups.findIndex(g => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...updates };
      this.saveServiceGroups(groups);

      if (window.supabaseClient) {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.icon !== undefined) payload.icon = updates.icon;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        window.supabaseClient.from('service_groups').update(payload).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase group update warning:', error);
        });
      }

      return groups[index];
    }
    return null;
  },

  deleteServiceGroup(id) {
    const groups = this.getServiceGroups().filter(g => g.id !== id);
    this.saveServiceGroups(groups);

    // Also delete child items locally
    const items = this.getServiceItems().filter(item => item.groupId !== id);
    this.saveServiceItems(items);

    if (window.supabaseClient) {
      window.supabaseClient.from('service_groups').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase group delete warning:', error);
      });
    }

    return groups;
  },

  // ─── SERVICE ITEMS CRUD ──────────────────────────────────────
  getServiceItems() {
    const data = localStorage.getItem("GILANGIN_ITEMS_V2");
    if (data) {
      try { return JSON.parse(data); } catch (e) {}
    }
    localStorage.setItem("GILANGIN_ITEMS_V2", JSON.stringify(DEFAULT_SERVICE_ITEMS));
    return DEFAULT_SERVICE_ITEMS;
  },

  saveServiceItems(items) {
    localStorage.setItem("GILANGIN_ITEMS_V2", JSON.stringify(items));
  },

  addServiceItem(item) {
    const items = this.getServiceItems();
    if (!item.id) {
      item.id = `${item.groupId || 'srv'}-${Date.now().toString().slice(-4)}`;
    }
    const updated = [item, ...items.filter(i => i.id !== item.id)];
    this.saveServiceItems(updated);

    if (window.supabaseClient) {
      window.supabaseClient.from('service_items').upsert([{
        id: item.id,
        group_id: item.groupId,
        name: item.name,
        price: Number(item.price || 50000),
        estimated_duration: item.estimatedDuration || "1 - 2 Jam",
        warranty: item.warranty || "Garansi 30 Hari",
        description: item.description || "",
        features: Array.isArray(item.features) ? item.features : [],
        is_active: item.isActive !== false,
        sort_order: Number(item.sortOrder || 0)
      }]).then(({ error }) => {
        if (error) console.warn('Supabase item insert warning:', error);
      });
    }

    return item;
  },

  updateServiceItem(id, updates) {
    const items = this.getServiceItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.saveServiceItems(items);

      if (window.supabaseClient) {
        const payload = {};
        if (updates.groupId !== undefined) payload.group_id = updates.groupId;
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.price !== undefined) payload.price = Number(updates.price);
        if (updates.estimatedDuration !== undefined) payload.estimated_duration = updates.estimatedDuration;
        if (updates.warranty !== undefined) payload.warranty = updates.warranty;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.features !== undefined) payload.features = updates.features;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        window.supabaseClient.from('service_items').update(payload).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase item update warning:', error);
        });
      }

      return items[index];
    }
    return null;
  },

  deleteServiceItem(id) {
    const items = this.getServiceItems().filter(i => i.id !== id);
    this.saveServiceItems(items);

    if (window.supabaseClient) {
      window.supabaseClient.from('service_items').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase item delete warning:', error);
      });
    }

    return items;
  },

  // ─── SYNC GROUPED SERVICES FROM SUPABASE ─────────────────────
  async syncGroupedServicesFromSupabase(callback) {
    if (!window.supabaseClient) return;
    try {
      // Sync groups
      const { data: cloudGroups, error: gErr } = await window.supabaseClient
        .from('service_groups')
        .select('*')
        .order('sort_order', { ascending: true });

      if (gErr) throw gErr;
      if (cloudGroups && cloudGroups.length > 0) {
        const mappedGroups = cloudGroups.map(g => ({
          id: g.id,
          name: g.name,
          icon: g.icon || "fa-wrench",
          color: g.color || "#3b82f6",
          description: g.description || "",
          isActive: Boolean(g.is_active),
          sortOrder: Number(g.sort_order || 0)
        }));
        this.saveServiceGroups(mappedGroups);
      }

      // Sync items
      const { data: cloudItems, error: iErr } = await window.supabaseClient
        .from('service_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (iErr) throw iErr;
      if (cloudItems && cloudItems.length > 0) {
        const mappedItems = cloudItems.map(item => ({
          id: item.id,
          groupId: item.group_id,
          name: item.name,
          price: Number(item.price || 50000),
          estimatedDuration: item.estimated_duration || "1 - 2 Jam",
          warranty: item.warranty || "Garansi 30 Hari",
          description: item.description || "",
          features: Array.isArray(item.features) ? item.features : [],
          isActive: Boolean(item.is_active),
          sortOrder: Number(item.sort_order || 0)
        }));
        this.saveServiceItems(mappedItems);
      }

      if (typeof callback === 'function') callback();
    } catch (e) {
      console.warn('Supabase grouped sync warning:', e.message);
    }
  },

  // ─── JOBS CRUD ─────────────────────────────────────────────
  getJobs() {
    const data = localStorage.getItem("GILANGIN_JOBS_V2");
    if (data) {
      try { return JSON.parse(data); } catch (e) {}
    }
    localStorage.setItem("GILANGIN_JOBS_V2", JSON.stringify(DEFAULT_JOBS));
    return DEFAULT_JOBS;
  },

  saveJobs(jobs) {
    localStorage.setItem("GILANGIN_JOBS_V2", JSON.stringify(jobs));
  },

  async syncFromSupabase(callback) {
    if (!window.supabaseClient) return;
    try {
      const { data, error } = await window.supabaseClient
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const cloudJobs = data.map(j => ({
          id: j.id,
          service: j.service,
          serviceGroup: j.service_group || '',
          serviceName: j.service_name || j.service,
          items: Array.isArray(j.items) ? j.items : [],
          totalPrice: Number(j.total_price || 0),
          customer: j.customer,
          phone: j.phone || '',
          date: j.date,
          time: j.time,
          address: j.address,
          radius: Number(j.radius || 5),
          notes: j.notes || '',
          status: j.status || 'menunggu',
          worker: j.worker || undefined,
          createdAt: Number(j.created_at),
          acceptedAt: j.accepted_at ? Number(j.accepted_at) : undefined,
          startedAt: j.started_at ? Number(j.started_at) : undefined,
          completedAt: j.completed_at ? Number(j.completed_at) : undefined,
        }));
        this.saveJobs(cloudJobs);
        if (typeof callback === 'function') callback(cloudJobs);
        return cloudJobs;
      }
    } catch (e) {
      console.warn('Supabase jobs sync warning:', e.message);
    }
  },

  addJob(job) {
    const jobs = this.getJobs();
    if (!job.id) {
      const maxNum = jobs.reduce((max, j) => {
        const num = parseInt(String(j.id).replace(/\D/g, ""), 10) || 0;
        return num > max ? num : max;
      }, 0);
      job.id = `JOB-${String(maxNum + 1).padStart(3, "0")}`;
    }
    if (!job.createdAt) job.createdAt = Date.now();

    const updated = [job, ...jobs.filter(j => j.id !== job.id)];
    this.saveJobs(updated);

    if (window.supabaseClient) {
      const payload = {
        id: job.id,
        service: job.service,
        service_group: job.serviceGroup || '',
        service_name: job.serviceName || job.service,
        items: Array.isArray(job.items) ? job.items : [],
        total_price: Number(job.totalPrice || 0),
        customer: job.customer,
        phone: job.phone || "",
        date: job.date,
        time: job.time,
        address: job.address,
        radius: Number(job.radius || 5),
        notes: job.notes || "",
        status: job.status || "menunggu",
        worker: job.worker || null,
        created_at: job.createdAt,
      };

      window.supabaseClient.from('jobs').insert([payload]).then(({ error }) => {
        if (error) console.warn('Supabase insert job warning:', error);
      });
    }

    return job;
  },

  updateJob(id, updates) {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      this.saveJobs(jobs);

      if (window.supabaseClient) {
        const payload = {};
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.worker !== undefined) payload.worker = updates.worker;
        if (updates.acceptedAt !== undefined) payload.accepted_at = updates.acceptedAt;
        if (updates.startedAt !== undefined) payload.started_at = updates.startedAt;
        if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        window.supabaseClient.from('jobs').update(payload).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase update job warning:', error);
        });
      }

      return jobs[index];
    }
    return null;
  },

  deleteJob(id) {
    const jobs = this.getJobs().filter(j => j.id !== id);
    this.saveJobs(jobs);

    if (window.supabaseClient) {
      window.supabaseClient.from('jobs').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase delete job warning:', error);
      });
    }

    return jobs;
  },

  formatIDR(val) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  },

  formatDate(timestamp) {
    if (!timestamp) return "-";
    const d = new Date(timestamp);
    const dateStr = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${dateStr}, ${hours}:${minutes} WIB`;
  }
};

window.AppStorage = Storage;
window.WORKERS = WORKERS;
window.LOCATIONS = LOCATIONS;
