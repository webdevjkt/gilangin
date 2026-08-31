/**
 * Gilangin - Admin Dashboard Controller (Grouped & Multi-Service Edition)
 * Auth via Supabase table public.admin_users + RPC verify_admin_login
 */

let activeAdminTab = "jobs";

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  initWorkerDropdown();
  initGroupDropdowns();

  const admDate = document.getElementById("admDate");
  if (admDate) admDate.value = new Date().toISOString().slice(0, 10);

  // Sync latest jobs, groups & items from Supabase Cloud
  if (window.AppStorage) {
    if (typeof window.AppStorage.syncFromSupabase === "function") {
      window.AppStorage.syncFromSupabase(() => {
        refreshAdminData();
      });
    }
    if (typeof window.AppStorage.syncGroupedServicesFromSupabase === "function") {
      window.AppStorage.syncGroupedServicesFromSupabase(() => {
        refreshAdminData();
      });
    }
  }
});

// ─── TAB SWITCHER ────────────────────────────────────────────────────────────
function switchAdminTab(tab) {
  activeAdminTab = tab;
  const jobsView = document.getElementById("adminJobsView");
  const servicesView = document.getElementById("adminServicesView");
  const tabJobsBtn = document.getElementById("adminTabJobsBtn");
  const tabServicesBtn = document.getElementById("adminTabServicesBtn");

  if (tab === "jobs") {
    jobsView.style.display = "block";
    servicesView.style.display = "none";
    tabJobsBtn.className = "btn btn-primary";
    tabServicesBtn.className = "btn btn-outline";
    renderAdminTable();
  } else {
    jobsView.style.display = "none";
    servicesView.style.display = "block";
    tabJobsBtn.className = "btn btn-outline";
    tabServicesBtn.className = "btn btn-primary";
    renderAdminGroupsTable();
    renderAdminItemsTable();
  }
}

// ─── AUTH FUNCTIONS ────────────────────────────────────────────────────────────
function checkAdminAuth() {
  const session = _getAdminSession();
  if (session) {
    _showDashboard(session);
  } else {
    _showLogin();
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();

  const usernameInput = document.getElementById("loginUsername");
  const passInput     = document.getElementById("loginPassword");
  const btn           = document.getElementById("loginSubmitBtn");

  const username = usernameInput.value.trim();
  const password = passInput.value;

  if (!username || !password) {
    showToast("Username dan password wajib diisi.", "error");
    return;
  }

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memverifikasi...'; }

  const client = window.supabaseClient;

  if (client) {
    try {
      const { data, error } = await client.rpc("verify_admin_login", {
        p_username: username,
        p_password: password,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const user = data[0];
        sessionStorage.setItem("SERVISKU_ADMIN_SESSION", JSON.stringify({
          id:        user.id,
          username:  user.username,
          fullName:  user.full_name,
          role:      user.role,
          loginAt:   Date.now(),
        }));
        _showDashboard(user);
        showToast(`Selamat datang, ${user.full_name}! 👋`, "success");
        refreshAdminData();
      } else {
        showToast("Username atau Password salah.", "error");
        passInput.value = "";
        passInput.focus();
      }
    } catch (err) {
      console.error("Login RPC error:", err);
      showToast("Gagal login: " + (err.message || "Coba lagi."), "error");
    }
  } else {
    if (username === "admin" && password === "radit1212") {
      const fakeSession = { id: "offline", username: "admin", fullName: "Super Admin", role: "superadmin", loginAt: Date.now() };
      sessionStorage.setItem("SERVISKU_ADMIN_SESSION", JSON.stringify(fakeSession));
      _showDashboard(fakeSession);
      showToast("Login berhasil (mode offline).", "success");
      refreshAdminData();
    } else {
      showToast("Login gagal: Username atau Password salah.", "error");
      passInput.value = "";
      passInput.focus();
    }
  }

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk Dashboard'; }
}

function handleAdminLogout() {
  sessionStorage.removeItem("SERVISKU_ADMIN_SESSION");
  _showLogin();
  showToast("Anda telah keluar dari sesi Admin.", "info");
}

function _getAdminSession() {
  try {
    const raw = sessionStorage.getItem("SERVISKU_ADMIN_SESSION");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function _showDashboard(user) {
  document.body.classList.remove("auth-locked");
  document.body.classList.add("auth-unlocked");

  const nameEl = document.getElementById("adminDisplayName");
  const roleEl = document.getElementById("adminDisplayRole");
  const navActions = document.getElementById("adminNavActions");

  if (navActions) navActions.style.display = "flex";
  const session = user || _getAdminSession();
  if (nameEl && session) nameEl.textContent = session.fullName || session.username || "Admin";
  if (roleEl && session) {
    const roleMap = { superadmin: "Super Admin", admin: "Admin" };
    roleEl.textContent = roleMap[session.role] || session.role;
  }

  refreshAdminData();
}

function _showLogin() {
  document.body.classList.remove("auth-unlocked");
  document.body.classList.add("auth-locked");
  const navActions = document.getElementById("adminNavActions");
  if (navActions) navActions.style.display = "none";
}

function togglePasswordVisibility() {
  const passInput = document.getElementById("loginPassword");
  const icon = document.getElementById("togglePasswordIcon");
  if (!passInput || !icon) return;
  if (passInput.type === "password") {
    passInput.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passInput.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// ─── INITIALIZERS ────────────────────────────────────────────────────────────
function initWorkerDropdown() {
  const select = document.getElementById("admWorker");
  if (!select) return;
  select.innerHTML = `<option value="">-- Belum Ditugaskan --</option>` +
    WORKERS.map(w => `<option value="${w}">${w}</option>`).join("");
}

function initGroupDropdowns() {
  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];

  // Filter dropdown on Item section
  const filterSelect = document.getElementById("adminItemGroupFilter");
  if (filterSelect) {
    filterSelect.innerHTML = `<option value="all">Semua Kategori Grup</option>` +
      groups.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
  }

  // Group selector in Item Modal
  const itemGroupSelect = document.getElementById("imGroupId");
  if (itemGroupSelect) {
    itemGroupSelect.innerHTML = groups.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
  }

  // Service item selector in Add Job Modal
  const admServiceSelect = document.getElementById("admService");
  if (admServiceSelect) {
    admServiceSelect.innerHTML = items.map(item => {
      const g = groups.find(x => x.id === item.groupId);
      return `<option value="${item.id}">[${g ? g.name : 'Layanan'}] ${item.name} (${window.AppStorage.formatIDR(item.price)})</option>`;
    }).join("");
  }
}

// ─── REFRESH DATA ────────────────────────────────────────────────────────────
function refreshAdminData() {
  renderAdminStats();
  renderAdminTable();
  renderAdminGroupsTable();
  renderAdminItemsTable();
  initGroupDropdowns();
}

// ─── TAB 1: MANAJEMEN PESANAN (JOBS) ──────────────────────────────────────────
function renderAdminStats() {
  const jobs = (window.AppStorage && window.AppStorage.getJobs()) || [];
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];

  const total = jobs.length;
  const pending = jobs.filter(j => j.status === "menunggu").length;
  const active = jobs.filter(j => j.status === "diterima" || j.status === "dikerjakan").length;
  const done = jobs.filter(j => j.status === "selesai").length;

  document.getElementById("statTotal").innerText = total;
  document.getElementById("statPending").innerText = pending;
  document.getElementById("statActive").innerText = active;
  document.getElementById("statDone").innerText = done;

  const totalBadge = document.getElementById("adminTotalServicesBadge");
  if (totalBadge) totalBadge.innerText = items.length;
}

function renderAdminTable() {
  const tbody = document.getElementById("adminTableBody");
  if (!tbody) return;

  const query = (document.getElementById("adminSearchInput")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("adminStatusFilter")?.value || "all";
  const jobs = (window.AppStorage && window.AppStorage.getJobs()) || [];

  const filtered = jobs.filter(job => {
    if (!job) return false;
    const matchQuery = !query ||
      (job.id && job.id.toLowerCase().includes(query)) ||
      (job.customer && job.customer.toLowerCase().includes(query)) ||
      (job.phone && job.phone.toLowerCase().includes(query)) ||
      (job.worker && job.worker.toLowerCase().includes(query)) ||
      (job.serviceName && job.serviceName.toLowerCase().includes(query)) ||
      (job.address && job.address.toLowerCase().includes(query));

    const matchStatus = statusFilter === "all" || job.status === statusFilter;
    return matchQuery && matchStatus;
  });

  document.getElementById("tableCountLabel").innerText = `Menampilkan ${filtered.length} dari ${jobs.length} pesanan`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px 12px; color: var(--text-light);">
          <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
          Tidak ada data pesanan yang sesuai filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(job => {
    const waLink = job.phone ? `https://wa.me/${formatWaNumber(job.phone)}?text=Halo%20${encodeURIComponent(job.customer)},%20kami%20dari%20Gilangin%20mengenai%20pesanan%20${job.id}` : '#';
    const items = Array.isArray(job.items) && job.items.length > 0 ? job.items : [
      { name: job.serviceName || job.service, price: job.totalPrice || 75000, groupName: "Layanan" }
    ];
    const totalPriceFormatted = window.AppStorage.formatIDR(job.totalPrice || items.reduce((s, i) => s + (i.price || 0), 0));

    return `
      <tr>
        <td>
          <div style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">${job.id}</div>
          <div style="font-size: 0.78rem; color: var(--text-light);">${window.AppStorage.formatDate(job.createdAt)}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600; margin-top: 2px;">
            <i class="fa-regular fa-clock"></i> ${job.date} • ${job.time} WIB
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--secondary); font-size: 0.9rem; margin-bottom: 4px;">
            ${items.length > 1 ? `<span style="background: #eff6ff; color: #2563eb; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 800;">${items.length} Layanan</span> ` : ''}
            ${items[0].name}
          </div>
          ${items.length > 1 ? `
            <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">
              + ${items.slice(1).map(i => i.name).join(", ")}
            </div>
          ` : ''}
          <div style="font-size: 0.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">
            Total: ${totalPriceFormatted}
          </div>
        </td>
        <td>
          <div style="font-weight: 700;">${job.customer}</div>
          ${job.phone ? `
            <a href="${waLink}" target="_blank" style="font-size: 0.78rem; color: #16a34a; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <i class="fa-brands fa-whatsapp"></i> ${job.phone}
            </a>
          ` : '<span style="font-size: 0.78rem; color: var(--text-light);">-</span>'}
          <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;" title="${job.address}">
            <i class="fa-solid fa-location-dot"></i> ${job.address}
          </div>
        </td>
        <td>
          <div class="select-box" style="margin-bottom: 0;">
            <select style="padding: 6px 10px; font-size: 0.8rem; font-weight: 600;" onchange="assignWorker('${job.id}', this.value)">
              <option value="" ${!job.worker ? 'selected' : ''}>-- Belum Ditugaskan --</option>
              ${WORKERS.map(w => `<option value="${w}" ${job.worker === w ? 'selected' : ''}>${w}</option>`).join("")}
            </select>
          </div>
        </td>
        <td>
          <div class="select-box" style="margin-bottom: 0;">
            <select class="status-select status-${job.status}" style="padding: 6px 10px; font-size: 0.8rem; font-weight: 700;" onchange="updateJobStatus('${job.id}', this.value)">
              <option value="menunggu" ${job.status === 'menunggu' ? 'selected' : ''}>Menunggu</option>
              <option value="diterima" ${job.status === 'diterima' ? 'selected' : ''}>Diterima</option>
              <option value="dikerjakan" ${job.status === 'dikerjakan' ? 'selected' : ''}>Dikerjakan</option>
              <option value="selesai" ${job.status === 'selesai' ? 'selected' : ''}>Selesai</option>
            </select>
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 4px; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm" onclick="openReceiptModal('${job.id}')" title="Cetak Nota" style="padding: 6px 9px;">
              <i class="fa-solid fa-receipt"></i>
            </button>
            <button class="btn btn-outline btn-sm" onclick="deleteJob('${job.id}')" title="Hapus Pesanan" style="padding: 6px 9px; color: #dc2626; border-color: #fecaca;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function updateJobStatus(id, newStatus) {
  const updates = { status: newStatus };
  const now = Date.now();

  if (newStatus === "diterima") updates.acceptedAt = now;
  if (newStatus === "dikerjakan") updates.startedAt = now;
  if (newStatus === "selesai") updates.completedAt = now;

  window.AppStorage.updateJob(id, updates);
  refreshAdminData();
  showToast(`Status pesanan #${id} diubah ke: ${newStatus.toUpperCase()}`, "success");
}

function assignWorker(id, workerName) {
  const updates = { worker: workerName || undefined };
  const current = (window.AppStorage.getJobs() || []).find(j => j.id === id);
  if (current && current.status === "menunggu" && workerName) {
    updates.status = "diterima";
    updates.acceptedAt = Date.now();
  }

  window.AppStorage.updateJob(id, updates);
  refreshAdminData();
  showToast(`Teknisi #${id} diperbarui: ${workerName || 'Belum ditugaskan'}`, "success");
}

function deleteJob(id) {
  if (confirm(`Apakah Anda yakin ingin menghapus pesanan #${id}?`)) {
    window.AppStorage.deleteJob(id);
    refreshAdminData();
    showToast(`Pesanan #${id} berhasil dihapus.`);
  }
}

function openAddJobModal() {
  initWorkerDropdown();
  initGroupDropdowns();
  const admDate = document.getElementById("admDate");
  if (admDate && !admDate.value) {
    admDate.value = new Date().toISOString().slice(0, 10);
  }
  openModal("addJobModal");
  setTimeout(() => {
    document.getElementById("admCustomer")?.focus();
  }, 100);
}

function handleAddJobSubmit(e) {
  e.preventDefault();

  try {
    const serviceItemId = document.getElementById("admService").value;
    const customer = document.getElementById("admCustomer").value.trim();
    const phone = document.getElementById("admPhone").value.trim();
    const date = document.getElementById("admDate").value || new Date().toISOString().slice(0, 10);
    const time = document.getElementById("admTime").value || "09:00";
    const address = document.getElementById("admAddress").value.trim();
    const worker = document.getElementById("admWorker").value;
    const notes = document.getElementById("admNotes").value.trim();

    const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];
    const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
    const selectedItem = items.find(i => i.id === serviceItemId);
    const selectedGroup = selectedItem ? groups.find(g => g.id === selectedItem.groupId) : null;

    if (!customer) {
      showToast("Harap isi nama pelanggan!", "error");
      document.getElementById("admCustomer")?.focus();
      return;
    }

    if (!address) {
      showToast("Harap isi alamat pengerjaan!", "error");
      document.getElementById("admAddress")?.focus();
      return;
    }

    const itemPayload = selectedItem ? [{
      id: selectedItem.id,
      groupId: selectedItem.groupId,
      groupName: selectedGroup ? selectedGroup.name : "Layanan",
      name: selectedItem.name,
      price: selectedItem.price
    }] : [];

    const newJob = {
      service: serviceItemId || "layanan",
      serviceGroup: selectedGroup ? selectedGroup.id : "umum",
      serviceName: selectedItem ? `${selectedGroup ? selectedGroup.name : ''}: ${selectedItem.name}` : "Layanan Servis",
      items: itemPayload,
      totalPrice: selectedItem ? selectedItem.price : 75000,
      customer,
      phone,
      date,
      time,
      address,
      worker: worker || undefined,
      notes,
      status: worker ? "diterima" : "menunggu",
    };

    const created = window.AppStorage.addJob(newJob);

    if (typeof window.sendTelegramNotification === "function") {
      window.sendTelegramNotification(created);
    }

    closeModal("addJobModal");
    const form = document.getElementById("addJobForm");
    if (form) form.reset();

    refreshAdminData();
    showToast(`Pesanan #${created.id} untuk ${customer} berhasil dibuat!`, "success");
  } catch (err) {
    console.error("Error creating job:", err);
    showToast("Gagal menyimpan pesanan: " + err.message, "error");
  }
}

// ─── TAB 2A: MANAJEMEN GRUP / KATEGORI LAYANAN ──────────────────────────────
function renderAdminGroupsTable() {
  const tbody = document.getElementById("adminGroupsTableBody");
  if (!tbody) return;

  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];

  if (groups.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-light);">Belum ada kategori/grup.</td></tr>`;
    return;
  }

  tbody.innerHTML = groups.map(g => {
    const groupItemsCount = items.filter(i => i.groupId === g.id).length;
    const color = g.color || "#3b82f6";
    const icon = g.icon || "fa-wrench";

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: ${color}18; color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              <i class="fa-solid ${icon}"></i>
            </div>
            <code style="font-weight: 700; color: var(--secondary); background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">${g.id}</code>
          </div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--secondary); font-size: 0.95rem;">${g.name}</div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
            <span style="font-size: 0.82rem; font-family: monospace;">${color}</span>
          </div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 250px;">${g.description || "-"}</div>
        </td>
        <td>
          <span style="font-weight: 700; background: #eff6ff; color: #2563eb; padding: 3px 8px; border-radius: var(--radius-full); font-size: 0.8rem;">
            ${groupItemsCount} Item Layanan
          </span>
        </td>
        <td>
          <span style="font-size: 0.76rem; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); background: ${g.isActive !== false ? '#d1fae5' : '#fee2e2'}; color: ${g.isActive !== false ? '#065f46' : '#991b1b'};">
            ${g.isActive !== false ? '● Aktif' : '○ Nonaktif'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm" onclick="openEditGroupModal('${g.id}')" title="Edit Kategori" style="padding: 5px 9px;">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-outline btn-sm" onclick="deleteGroup('${g.id}')" title="Hapus Kategori" style="padding: 5px 9px; color: #dc2626; border-color: #fecaca;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function openAddGroupModal() {
  document.getElementById("modalGroupTitle").innerText = "Tambah Kategori / Grup Baru";
  document.getElementById("groupForm").reset();
  document.getElementById("gmEditId").value = "";
  document.getElementById("gmId").disabled = false;
  document.getElementById("gmActive").checked = true;

  openModal("groupModal");
  setTimeout(() => document.getElementById("gmName")?.focus(), 100);
}

function openEditGroupModal(id) {
  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const group = groups.find(g => g.id === id);
  if (!group) return;

  document.getElementById("modalGroupTitle").innerText = `Edit Kategori: ${group.name}`;
  document.getElementById("gmEditId").value = group.id;
  document.getElementById("gmId").value = group.id;
  document.getElementById("gmId").disabled = true;

  document.getElementById("gmName").value = group.name || "";
  document.getElementById("gmIcon").value = group.icon || "fa-wrench";
  document.getElementById("gmColor").value = group.color || "#3b82f6";
  document.getElementById("gmDescription").value = group.description || "";
  document.getElementById("gmActive").checked = group.isActive !== false;

  openModal("groupModal");
}

function handleGroupFormSubmit(e) {
  e.preventDefault();

  try {
    const editId = document.getElementById("gmEditId").value;
    const id = editId || document.getElementById("gmId").value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const name = document.getElementById("gmName").value.trim();
    const icon = document.getElementById("gmIcon").value;
    const color = document.getElementById("gmColor").value;
    const description = document.getElementById("gmDescription").value.trim();
    const isActive = document.getElementById("gmActive").checked;

    const groupData = { id, name, icon, color, description, isActive };

    if (editId) {
      window.AppStorage.updateServiceGroup(editId, groupData);
      showToast(`Kategori "${name}" berhasil diperbarui!`, "success");
    } else {
      window.AppStorage.addServiceGroup(groupData);
      showToast(`Kategori baru "${name}" berhasil ditambahkan!`, "success");
    }

    closeModal("groupModal");
    refreshAdminData();
  } catch (err) {
    console.error("Error saving group:", err);
    showToast("Gagal menyimpan kategori: " + err.message, "error");
  }
}

function deleteGroup(id) {
  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const group = groups.find(g => g.id === id);
  const name = group ? group.name : id;

  if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}" beserta semua item layanan di dalamnya?`)) {
    window.AppStorage.deleteServiceGroup(id);
    refreshAdminData();
    showToast(`Kategori "${name}" dan item layanannya telah dihapus.`);
  }
}

// ─── TAB 2B: MANAJEMEN PAKET / ITEM LAYANAN ──────────────────────────────────
function renderAdminItemsTable() {
  const tbody = document.getElementById("adminItemsTableBody");
  if (!tbody) return;

  const query = (document.getElementById("adminItemSearchInput")?.value || "").toLowerCase().trim();
  const groupFilter = document.getElementById("adminItemGroupFilter")?.value || "all";

  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];
  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];

  const filtered = items.filter(item => {
    if (!item) return false;
    const matchQuery = !query ||
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.id && item.id.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query));

    const matchGroup = groupFilter === "all" || item.groupId === groupFilter;
    return matchQuery && matchGroup;
  });

  const countLabel = document.getElementById("itemTableCountLabel");
  if (countLabel) countLabel.innerText = `Menampilkan ${filtered.length} dari ${items.length} item layanan`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-light);">Tidak ada item layanan yang sesuai filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const group = groups.find(g => g.id === item.groupId) || { name: item.groupId, color: "#3b82f6", icon: "fa-wrench" };
    const featuresPreview = Array.isArray(item.features) ? item.features.slice(0, 2).join(", ") : "-";

    return `
      <tr>
        <td>
          <code style="font-weight: 700; color: var(--secondary); background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">${item.id}</code>
        </td>
        <td>
          <span style="font-weight: 700; color: ${group.color}; background: ${group.color}15; padding: 3px 8px; border-radius: var(--radius-full); font-size: 0.78rem;">
            <i class="fa-solid ${group.icon}"></i> ${group.name}
          </span>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--secondary); font-size: 0.95rem;">${item.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.description || "-"}</div>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--primary);">${window.AppStorage.formatIDR(item.price || 50000)}</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; font-weight: 600;">${item.estimatedDuration || "1 - 2 Jam"}</div>
          <div style="font-size: 0.75rem; color: #059669; font-weight: 700;">${item.warranty || "Garansi 30 Hari"}</div>
        </td>
        <td>
          <div style="font-size: 0.78rem; color: var(--text-muted); max-width: 200px;">${featuresPreview}</div>
        </td>
        <td>
          <span style="font-size: 0.76rem; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-full); background: ${item.isActive !== false ? '#d1fae5' : '#fee2e2'}; color: ${item.isActive !== false ? '#065f46' : '#991b1b'};">
            ${item.isActive !== false ? '● Aktif' : '○ Nonaktif'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="btn btn-outline btn-sm" onclick="openEditItemModal('${item.id}')" title="Edit Item" style="padding: 5px 9px;">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn btn-outline btn-sm" onclick="deleteItem('${item.id}')" title="Hapus Item" style="padding: 5px 9px; color: #dc2626; border-color: #fecaca;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function openAddItemModal() {
  initGroupDropdowns();
  document.getElementById("modalItemTitle").innerText = "Tambah Item Layanan Baru";
  document.getElementById("itemForm").reset();
  document.getElementById("imEditId").value = "";
  document.getElementById("imId").disabled = false;
  document.getElementById("imPrice").value = 100000;
  document.getElementById("imDuration").value = "1 - 2 Jam";
  document.getElementById("imWarranty").value = "Garansi 30 Hari";
  document.getElementById("imActive").checked = true;

  openModal("itemModal");
  setTimeout(() => document.getElementById("imName")?.focus(), 100);
}

function openEditItemModal(id) {
  initGroupDropdowns();
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];
  const item = items.find(i => i.id === id);
  if (!item) return;

  document.getElementById("modalItemTitle").innerText = `Edit Item: ${item.name}`;
  document.getElementById("imEditId").value = item.id;
  document.getElementById("imId").value = item.id;
  document.getElementById("imId").disabled = true;

  document.getElementById("imGroupId").value = item.groupId;
  document.getElementById("imName").value = item.name || "";
  document.getElementById("imPrice").value = item.price || 50000;
  document.getElementById("imDuration").value = item.estimatedDuration || "1 - 2 Jam";
  document.getElementById("imWarranty").value = item.warranty || "Garansi 30 Hari";
  document.getElementById("imDescription").value = item.description || "";
  document.getElementById("imFeatures").value = Array.isArray(item.features) ? item.features.join("\n") : "";
  document.getElementById("imActive").checked = item.isActive !== false;

  openModal("itemModal");
}

function handleItemFormSubmit(e) {
  e.preventDefault();

  try {
    const editId = document.getElementById("imEditId").value;
    const id = editId || document.getElementById("imId").value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const groupId = document.getElementById("imGroupId").value;
    const name = document.getElementById("imName").value.trim();
    const price = Number(document.getElementById("imPrice").value) || 50000;
    const estimatedDuration = document.getElementById("imDuration").value.trim() || "1 - 2 Jam";
    const warranty = document.getElementById("imWarranty").value.trim() || "Garansi 30 Hari";
    const description = document.getElementById("imDescription").value.trim();
    const isActive = document.getElementById("imActive").checked;

    const rawFeats = document.getElementById("imFeatures").value;
    const features = rawFeats.split(/\n|,/).map(f => f.trim()).filter(Boolean);

    const itemData = {
      id,
      groupId,
      name,
      price,
      estimatedDuration,
      warranty,
      description,
      features: features.length > 0 ? features : ["Teknisi Berpengalaman", "Garansi Pengerjaan"],
      isActive
    };

    if (editId) {
      window.AppStorage.updateServiceItem(editId, itemData);
      showToast(`Item "${name}" berhasil diperbarui!`, "success");
    } else {
      window.AppStorage.addServiceItem(itemData);
      showToast(`Item baru "${name}" berhasil ditambahkan!`, "success");
    }

    closeModal("itemModal");
    refreshAdminData();
  } catch (err) {
    console.error("Error saving item:", err);
    showToast("Gagal menyimpan item: " + err.message, "error");
  }
}

function deleteItem(id) {
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];
  const item = items.find(i => i.id === id);
  const name = item ? item.name : id;

  if (confirm(`Apakah Anda yakin ingin menghapus item layanan "${name}"?`)) {
    window.AppStorage.deleteServiceItem(id);
    refreshAdminData();
    showToast(`Item "${name}" telah dihapus.`);
  }
}

// ─── RECEIPT MODAL ───────────────────────────────────────────────────────────
function openReceiptModal(id) {
  const job = (window.AppStorage && window.AppStorage.getJobs()).find(j => j.id === id);
  if (!job) return;

  const items = Array.isArray(job.items) && job.items.length > 0 ? job.items : [
    { name: job.serviceName || job.service, price: job.totalPrice || 75000 }
  ];
  const totalPriceFormatted = window.AppStorage.formatIDR(job.totalPrice || items.reduce((s, i) => s + (i.price || 0), 0));

  const itemsHtml = items.map(item => `
    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
      <span>• ${item.name}</span>
      <span style="font-weight: 700;">${window.AppStorage.formatIDR(item.price || 0)}</span>
    </div>
  `).join("");

  document.getElementById("rcpId").innerText = job.id;
  document.getElementById("rcpDate").innerText = `${job.date} - ${job.time} WIB`;
  document.getElementById("rcpCustomer").innerText = job.customer;
  document.getElementById("rcpPhone").innerText = job.phone || "-";
  document.getElementById("rcpService").innerHTML = `
    <div style="margin-top: 6px;">${itemsHtml}</div>
    <div style="display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 6px; font-weight: 800; color: #2563eb;">
      <span>Total Biaya:</span>
      <span>${totalPriceFormatted}</span>
    </div>
  `;
  document.getElementById("rcpWorker").innerText = job.worker || "Menunggu Penugasan";
  document.getElementById("rcpStatus").innerText = capitalize(job.status);
  document.getElementById("rcpNotes").innerText = `${job.address}${job.notes ? ` (Catatan: ${job.notes})` : ''}`;

  openModal("receiptModal");
}

// ─── MODAL & UTILITY HELPERS ──────────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatWaNumber(phone) {
  if (!phone) return "";
  let clean = phone.replace(/[^0-9]/g, "");
  if (clean.startsWith("0")) clean = "62" + clean.slice(1);
  return clean;
}
