/**
 * Gilangin - Multi-Service & Grouped Frontend Controller (Pure JavaScript)
 */

let selectedGroupId = "all";
let selectedCartItems = []; // Array of { id, groupId, groupName, name, price, icon, color }

document.addEventListener("DOMContentLoaded", () => {
  initLocations();
  renderGroupPills();
  renderGroupedServices();
  renderTrackingJobs();
  updateFloatingCart();
  
  // Set default booking date to today
  const dateInput = document.getElementById("bkDate");
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
    dateInput.min = new Date().toISOString().slice(0, 10);
  }

  // Sync latest grouped services & jobs from Supabase Cloud
  if (window.AppStorage) {
    if (typeof window.AppStorage.syncGroupedServicesFromSupabase === "function") {
      window.AppStorage.syncGroupedServicesFromSupabase(() => {
        renderGroupPills();
        renderGroupedServices();
      });
    }
    if (typeof window.AppStorage.syncFromSupabase === "function") {
      window.AppStorage.syncFromSupabase(() => renderTrackingJobs());
    }
  }
});

// Switch Main Tab (Katalog Layanan vs Tracking)
function switchMainTab(tab) {
  const sectionCatalog = document.getElementById("sectionCatalog");
  const sectionTracking = document.getElementById("sectionTracking");
  const tabCatalog = document.getElementById("tabCatalog");
  const tabTracking = document.getElementById("tabTracking");
  const navCatalogBtn = document.getElementById("navCatalogBtn");
  const navTrackingBtn = document.getElementById("navTrackingBtn");

  if (tab === "catalog") {
    sectionCatalog.style.display = "block";
    sectionTracking.style.display = "none";
    tabCatalog?.classList.add("active");
    tabTracking?.classList.remove("active");
    navCatalogBtn?.classList.add("active");
    navTrackingBtn?.classList.remove("active");
    updateFloatingCart();
  } else {
    sectionCatalog.style.display = "none";
    sectionTracking.style.display = "block";
    tabCatalog?.classList.remove("active");
    tabTracking?.classList.add("active");
    navCatalogBtn?.classList.remove("active");
    navTrackingBtn?.classList.add("active");
    document.getElementById("floatingCartBar")?.classList.remove("active");
    renderTrackingJobs();
  }
}

// Populate Locations Dropdown (Jabodetabek)
function initLocations() {
  const locFilter = document.getElementById("locationFilter");
  const bkLocation = document.getElementById("bkLocation");

  if (locFilter) {
    locFilter.innerHTML = LOCATIONS.map(loc => `<option value="${loc}">${loc}</option>`).join("");
  }
  if (bkLocation) {
    const validLocations = LOCATIONS.filter(loc => !loc.startsWith("Semua Lokasi"));
    bkLocation.innerHTML = validLocations.map(loc => `<option value="${loc}">${loc}</option>`).join("");
  }
}

// Render Group Filter Pills
function renderGroupPills() {
  const container = document.getElementById("groupFilterPills");
  if (!container) return;

  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const activeGroups = groups.filter(g => g.isActive !== false);

  let pillsHtml = `
    <button class="cat-pill ${selectedGroupId === 'all' ? 'active' : ''}" onclick="selectGroupFilter('all')">
      <i class="fa-solid fa-layer-group"></i> Semua Kategori
    </button>
  `;

  activeGroups.forEach(g => {
    pillsHtml += `
      <button class="cat-pill ${selectedGroupId === g.id ? 'active' : ''}" onclick="selectGroupFilter('${g.id}')">
        <i class="fa-solid ${g.icon || 'fa-wrench'}" style="color: ${selectedGroupId === g.id ? '#fff' : g.color};"></i> ${g.name}
      </button>
    `;
  });

  container.innerHTML = pillsHtml;
}

function selectGroupFilter(groupId) {
  selectedGroupId = groupId;
  renderGroupPills();
  renderGroupedServices();
}

function handleSearchFilter() {
  renderGroupedServices();
}

function resetFilters() {
  const searchInput = document.getElementById("searchInput");
  const locationSelect = document.getElementById("locationFilter");

  if (searchInput) searchInput.value = "";
  if (locationSelect) locationSelect.value = LOCATIONS[0];

  selectedGroupId = "all";
  renderGroupPills();
  renderGroupedServices();
  showToast("Filter pencarian di-reset");
}

// ─── MULTI-SERVICE CART MANAGEMENT ──────────────────────────────────────────
function toggleItemCart(itemId) {
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];
  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const group = groups.find(g => g.id === item.groupId) || { name: "Layanan", icon: "fa-wrench", color: "#3b82f6" };
  const existingIndex = selectedCartItems.findIndex(c => c.id === itemId);

  if (existingIndex !== -1) {
    selectedCartItems.splice(existingIndex, 1);
    showToast(`"${item.name}" dihapus dari daftar pesanan.`, "info");
  } else {
    selectedCartItems.push({
      id: item.id,
      groupId: group.id,
      groupName: group.name,
      name: item.name,
      price: Number(item.price || 50000),
      icon: group.icon,
      color: group.color
    });
    showToast(`"${item.name}" ditambahkan ke pesanan! (${selectedCartItems.length} layanan)`, "success");
  }

  renderGroupedServices();
  updateFloatingCart();
}

function removeCartItem(itemId) {
  selectedCartItems = selectedCartItems.filter(c => c.id !== itemId);
  renderGroupedServices();
  updateFloatingCart();
  renderModalSelectedItems();

  if (selectedCartItems.length === 0) {
    closeModal("bookingModal");
    showToast("Semua layanan telah dihapus dari pesanan.", "info");
  }
}

function clearCart() {
  selectedCartItems = [];
  renderGroupedServices();
  updateFloatingCart();
  showToast("Keranjang layanan telah dibersihkan.");
}

function updateFloatingCart() {
  const bar = document.getElementById("floatingCartBar");
  if (!bar) return;

  const countEl = document.getElementById("cartCount");
  const btnCountEl = document.getElementById("cartBtnCount");
  const priceEl = document.getElementById("cartTotalPrice");

  const totalCount = selectedCartItems.length;
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.price, 0);

  if (countEl) countEl.innerText = totalCount;
  if (btnCountEl) btnCountEl.innerText = totalCount;
  if (priceEl) priceEl.innerText = window.AppStorage.formatIDR(totalPrice);

  if (totalCount > 0) {
    bar.classList.add("active");
  } else {
    bar.classList.remove("active");
  }
}

// ─── RENDER CATALOG ─────────────────────────────────────────────────────────
function renderGroupedServices() {
  const container = document.getElementById("groupsContainer");
  if (!container) return;

  const searchInput = document.getElementById("searchInput");
  const query = (searchInput ? searchInput.value : "").toLowerCase().trim();

  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];

  let targetGroups = groups.filter(g => g.isActive !== false);
  if (selectedGroupId !== "all") {
    targetGroups = targetGroups.filter(g => g.id === selectedGroupId);
  }

  let html = "";
  let totalVisibleItems = 0;

  targetGroups.forEach(group => {
    const groupItems = items.filter(item => {
      if (item.groupId !== group.id || item.isActive === false) return false;
      if (!query) return true;

      const name = (item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const gName = (group.name || "").toLowerCase();
      const feats = Array.isArray(item.features) ? item.features.join(" ").toLowerCase() : "";

      return name.includes(query) || desc.includes(query) || gName.includes(query) || feats.includes(query);
    });

    if (groupItems.length === 0) return;
    totalVisibleItems += groupItems.length;

    const groupColor = group.color || "#3b82f6";
    const groupIcon = group.icon || "fa-wrench";

    html += `
      <div class="service-group-section" style="margin-bottom: 36px;">
        <!-- Group Header Card -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid var(--border-color); border-left: 5px solid ${groupColor}; border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 46px; height: 46px; border-radius: var(--radius-md); background: ${groupColor}15; color: ${groupColor}; display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">
              <i class="fa-solid ${groupIcon}"></i>
            </div>
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--secondary); margin-bottom: 2px;">${group.name}</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0;">${group.description || ""}</p>
            </div>
          </div>
          <span style="font-size: 0.78rem; font-weight: 700; background: #f1f5f9; color: var(--text-muted); padding: 4px 10px; border-radius: var(--radius-full);">
            ${groupItems.length} Pilihan Layanan
          </span>
        </div>

        <!-- Grid of Service Items inside Group -->
        <div class="vendor-grid">
          ${groupItems.map(item => {
            const isSelected = selectedCartItems.some(c => c.id === item.id);
            const priceFormatted = window.AppStorage.formatIDR(item.price || 50000);
            const features = Array.isArray(item.features) ? item.features : [];

            return `
              <div class="vendor-card ${isSelected ? 'is-selected' : ''}" style="border-top: 3px solid ${groupColor}; position: relative;">
                ${isSelected ? `
                  <div style="position: absolute; top: 12px; right: 12px; background: #2563eb; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; box-shadow: 0 2px 8px rgba(37,99,235,0.4);">
                    <i class="fa-solid fa-check"></i>
                  </div>
                ` : ''}

                <div>
                  <div class="vendor-header">
                    <span class="vendor-category-badge" style="background: ${groupColor}15; color: ${groupColor}; font-weight: 700;">
                      <i class="fa-solid ${groupIcon}"></i> ${group.name}
                    </span>
                    <span style="font-size: 0.76rem; font-weight: 700; color: #059669; background: #d1fae5; padding: 2px 8px; border-radius: var(--radius-full);">
                      <i class="fa-solid fa-shield-check"></i> ${item.warranty || "Garansi Resmi"}
                    </span>
                  </div>

                  <h3 class="vendor-title" style="margin-top: 10px; font-size: 1.1rem;">
                    ${item.name}
                  </h3>
                  <p class="vendor-tagline" style="min-height: 38px;">${item.description || ""}</p>

                  <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 12px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); font-weight: 600; margin-bottom: 6px;">
                      <span><i class="fa-regular fa-clock"></i> Estimasi: <strong>${item.estimatedDuration || "1 - 2 Jam"}</strong></span>
                    </div>
                    ${features.length > 0 ? `
                      <ul style="padding-left: 16px; margin: 0; font-size: 0.8rem; color: var(--text-main); line-height: 1.45;">
                        ${features.slice(0, 3).map(f => `<li>${f}</li>`).join("")}
                      </ul>
                    ` : ''}
                  </div>
                </div>

                <div class="vendor-footer">
                  <div>
                    <span class="vendor-price-label">Tarif Paket</span>
                    <span class="vendor-price-val" style="color: ${groupColor}; font-size: 1.15rem;">${priceFormatted}</span>
                  </div>
                  <div class="vendor-actions">
                    <button class="btn btn-outline btn-sm" onclick="openServiceItemDetail('${item.id}')">
                      Detail
                    </button>
                    <button class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="toggleItemCart('${item.id}')" style="${isSelected ? 'background: #2563eb; color: #fff;' : ''}">
                      <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-plus'}"></i> ${isSelected ? 'Terpilih' : 'Pilih'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  });

  if (totalVisibleItems === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: var(--text-light); margin-bottom: 12px;"></i>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--secondary); margin-bottom: 6px;">Layanan tidak ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Coba gunakan kata kunci pencarian lain (misal: Coating, Cuci AC, Laptop, Jamur kaca, dll).</p>
      </div>
    `;
    return;
  }

  container.innerHTML = html;
}

// ─── DETAIL & BOOKING MODALS ────────────────────────────────────────────────
function openServiceItemDetail(itemId) {
  const items = (window.AppStorage && window.AppStorage.getServiceItems()) || [];
  const groups = (window.AppStorage && window.AppStorage.getServiceGroups()) || [];
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const group = groups.find(g => g.id === item.groupId) || { name: "Layanan", icon: "fa-wrench", color: "#3b82f6" };
  const isSelected = selectedCartItems.some(c => c.id === item.id);

  document.getElementById("sdName").innerText = item.name;
  document.getElementById("sdGroupBadge").innerHTML = `<i class="fa-solid ${group.icon}"></i> Kategori: <strong>${group.name}</strong>`;
  document.getElementById("sdDescription").innerText = item.description || "";
  document.getElementById("sdPrice").innerText = window.AppStorage.formatIDR(item.price || 50000);
  document.getElementById("sdWarranty").innerText = `${item.estimatedDuration || "1 - 2 Jam"} • ${item.warranty || "Garansi Resmi"}`;

  const features = Array.isArray(item.features) ? item.features : [];
  document.getElementById("sdFeatures").innerHTML = features.map(f => `<span class="v-badge">${f}</span>`).join("");

  const bookBtn = document.getElementById("sdBookBtn");
  bookBtn.innerHTML = `<i class="fa-solid ${isSelected ? 'fa-check' : 'fa-cart-plus'}"></i> ${isSelected ? 'Sudah Dipilih (Buka Pesanan)' : 'Tambah ke Pesanan'}`;
  bookBtn.onclick = () => {
    closeModal("serviceDetailModal");
    if (!isSelected) {
      toggleItemCart(item.id);
    }
    openMultiBookingModal();
  };

  openModal("serviceDetailModal");
}

function openMultiBookingModal() {
  if (selectedCartItems.length === 0) {
    showToast("Pilih minimal 1 layanan terlebih dahulu!", "error");
    return;
  }

  renderModalSelectedItems();
  openModal("bookingModal");
  setTimeout(() => {
    document.getElementById("bkCustomer")?.focus();
  }, 100);
}

function renderModalSelectedItems() {
  const container = document.getElementById("modalSelectedItemsList");
  const countEl = document.getElementById("modalCartCount");
  const priceDisplay = document.getElementById("modalTotalPriceDisplay");

  if (!container) return;

  if (countEl) countEl.innerText = selectedCartItems.length;
  const totalPrice = selectedCartItems.reduce((sum, i) => sum + i.price, 0);
  if (priceDisplay) priceDisplay.innerText = window.AppStorage.formatIDR(totalPrice);

  if (selectedCartItems.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-light); padding: 12px;">Belum ada layanan yang dipilih.</div>`;
    return;
  }

  container.innerHTML = selectedCartItems.map((item, idx) => `
    <div class="selected-item-row">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 800; color: var(--text-light); font-size: 0.85rem;">#${idx + 1}</span>
        <div>
          <div style="font-weight: 700; color: var(--secondary); font-size: 0.9rem;">
            ${item.name}
          </div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">
            <i class="fa-solid ${item.icon || 'fa-wrench'}"></i> ${item.groupName}
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <strong style="color: var(--primary); font-size: 0.95rem;">${window.AppStorage.formatIDR(item.price)}</strong>
        <button type="button" onclick="removeCartItem('${item.id}')" title="Hapus layanan ini" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 4px 6px; font-size: 1rem;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join("");
}

// ─── SUBMIT MULTI-SERVICE BOOKING ───────────────────────────────────────────
function handleBookingSubmit(e) {
  e.preventDefault();
  if (selectedCartItems.length === 0) {
    showToast("Pilih minimal 1 layanan terlebih dahulu!", "error");
    return;
  }

  const customer = document.getElementById("bkCustomer").value.trim();
  const phone = document.getElementById("bkPhone").value.trim();
  const date = document.getElementById("bkDate").value;
  const time = document.getElementById("bkTime").value;
  const location = document.getElementById("bkLocation").value;
  const address = document.getElementById("bkAddress").value.trim();
  const notes = document.getElementById("bkNotes").value.trim();

  const fullAddress = `${address} (${location})`;
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.price, 0);
  
  // Format summary names
  const serviceSummary = selectedCartItems.map(i => `${i.groupName}: ${i.name}`).join(" + ");
  const primaryGroup = selectedCartItems[0].groupId;
  const primaryService = selectedCartItems[0].id;

  const newJob = {
    service: primaryService,
    serviceGroup: primaryGroup,
    serviceName: serviceSummary,
    items: [...selectedCartItems],
    totalPrice: totalPrice,
    customer,
    phone,
    date,
    time,
    address: fullAddress,
    notes,
    status: "menunggu",
  };

  const created = window.AppStorage.addJob(newJob);

  // Send Telegram Notification with full multi-item breakdown
  if (typeof window.sendTelegramNotification === "function") {
    window.sendTelegramNotification(created);
  }

  closeModal("bookingModal");
  document.getElementById("bookingForm").reset();
  
  // Reset cart
  selectedCartItems = [];
  renderGroupedServices();
  updateFloatingCart();

  showToast(`Pesanan #${created.id} (${created.items.length} layanan) berhasil dikirim!`, "success");
  
  // Switch to tracking tab
  switchMainTab("tracking");
  document.getElementById("trackingSearchInput").value = created.id;
  renderTrackingJobs();
}

// ─── TRACKING ORDERS ─────────────────────────────────────────────────────────
function renderTrackingJobs() {
  const listContainer = document.getElementById("trackingList");
  if (!listContainer) return;

  const query = (document.getElementById("trackingSearchInput")?.value || "").toLowerCase().trim();
  const jobs = (window.AppStorage && window.AppStorage.getJobs()) || [];

  const filtered = jobs.filter(j => {
    if (!j) return false;
    const matchId = (j.id || "").toLowerCase().includes(query);
    const matchCustomer = (j.customer || "").toLowerCase().includes(query);
    const matchPhone = (j.phone || "").toLowerCase().includes(query);
    return !query || matchId || matchCustomer || matchPhone;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: var(--text-light); margin-bottom: 12px;"></i>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--secondary); margin-bottom: 6px;">Tidak ada pesanan ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Pastikan ID pesanan (contoh: JOB-101) atau nomor HP sudah benar.</p>
      </div>
    `;
    return;
  }

  const statusMap = {
    menunggu: { label: "Menunggu Konfirmasi", step: 1, color: "#d97706", icon: "fa-hourglass-start" },
    diterima: { label: "Pesanan Diterima", step: 2, color: "#2563eb", icon: "fa-clipboard-check" },
    dikerjakan: { label: "Sedang Dikerjakan", step: 3, color: "#9333ea", icon: "fa-screwdriver-wrench" },
    selesai: { label: "Pekerjaan Selesai", step: 4, color: "#059669", icon: "fa-circle-check" },
  };

  listContainer.innerHTML = filtered.map(job => {
    const currentStatus = statusMap[job.status] || statusMap.menunggu;
    const items = Array.isArray(job.items) && job.items.length > 0 ? job.items : [
      { name: job.serviceName || job.service, price: job.totalPrice || 75000, groupName: "Layanan" }
    ];
    const totalPriceFormatted = window.AppStorage.formatIDR(job.totalPrice || items.reduce((s, i) => s + (i.price || 0), 0));

    return `
      <div class="tracking-card">
        <div class="tracking-header">
          <div>
            <div class="tracking-id">
              <i class="fa-solid fa-ticket"></i> ${job.id}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Dipesan pada: ${window.AppStorage.formatDate(job.createdAt)}
            </div>
          </div>
          <div>
            <span class="status-badge status-${job.status}">
              <i class="fa-solid ${currentStatus.icon}"></i> ${currentStatus.label}
            </span>
          </div>
        </div>

        <!-- Breakdown Multi-Layanan -->
        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px;">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--secondary); margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span><i class="fa-solid fa-list-check" style="color: var(--primary);"></i> Paket Layanan (${items.length}):</span>
            <span style="color: var(--primary); font-size: 0.95rem; font-weight: 800;">Total: ${totalPriceFormatted}</span>
          </div>
          <ul style="padding-left: 18px; margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.6;">
            ${items.map(item => `
              <li>
                <strong>${item.name}</strong> 
                <span style="color: var(--text-muted); font-size: 0.78rem;">(${item.groupName || ''})</span> 
                — <span style="font-weight: 700; color: var(--primary);">${window.AppStorage.formatIDR(item.price || 0)}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        <div class="tracking-details-grid">
          <div class="tracking-detail-item">
            <span class="tracking-detail-label">Nama Pemesan</span>
            <span class="tracking-detail-val">${job.customer}</span>
          </div>
          <div class="tracking-detail-item">
            <span class="tracking-detail-label">Jadwal Kedatangan</span>
            <span class="tracking-detail-val">
              <i class="fa-solid fa-calendar-day" style="color: var(--text-light);"></i> ${job.date} • ${job.time} WIB
            </span>
          </div>
          <div class="tracking-detail-item" style="grid-column: span 2;">
            <span class="tracking-detail-label">Teknisi Bertugas</span>
            <span class="tracking-detail-val" style="color: ${job.worker ? 'var(--secondary)' : 'var(--text-light)'}; font-weight: 700;">
              <i class="fa-solid fa-user-gear"></i> ${job.worker || 'Sedang Ditugaskan...'}
            </span>
          </div>
        </div>

        <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 12px; margin-bottom: 18px; border: 1px solid var(--border-color); font-size: 0.85rem;">
          <div style="font-weight: 700; color: var(--secondary); margin-bottom: 4px;">
            <i class="fa-solid fa-location-dot" style="color: var(--primary);"></i> Alamat Pengerjaan:
          </div>
          <p style="color: var(--text-main); margin-bottom: ${job.notes ? '6px' : '0'};">${job.address}</p>
          ${job.notes ? `<div style="font-size: 0.82rem; color: var(--text-muted);"><strong>Catatan:</strong> ${job.notes}</div>` : ''}
        </div>

        <!-- Progress Timeline Steps -->
        <div class="progress-timeline">
          <div class="timeline-step ${currentStatus.step >= 1 ? 'completed' : ''} ${currentStatus.step === 1 ? 'active' : ''}">
            <div class="timeline-circle"><i class="fa-solid fa-hourglass-start"></i></div>
            <div class="timeline-text">Menunggu</div>
          </div>
          <div class="timeline-line ${currentStatus.step >= 2 ? 'completed' : ''}"></div>

          <div class="timeline-step ${currentStatus.step >= 2 ? 'completed' : ''} ${currentStatus.step === 2 ? 'active' : ''}">
            <div class="timeline-circle"><i class="fa-solid fa-clipboard-check"></i></div>
            <div class="timeline-text">Diterima</div>
          </div>
          <div class="timeline-line ${currentStatus.step >= 3 ? 'completed' : ''}"></div>

          <div class="timeline-step ${currentStatus.step >= 3 ? 'completed' : ''} ${currentStatus.step === 3 ? 'active' : ''}">
            <div class="timeline-circle"><i class="fa-solid fa-screwdriver-wrench"></i></div>
            <div class="timeline-text">Dikerjakan</div>
          </div>
          <div class="timeline-line ${currentStatus.step >= 4 ? 'completed' : ''}"></div>

          <div class="timeline-step ${currentStatus.step >= 4 ? 'completed' : ''} ${currentStatus.step === 4 ? 'active' : ''}">
            <div class="timeline-circle"><i class="fa-solid fa-circle-check"></i></div>
            <div class="timeline-text">Selesai</div>
          </div>
        </div>

        <!-- Action Bar -->
        <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
          <a href="https://wa.me/628112345678?text=Halo%20Admin%20Gilangin,%20saya%20ingin%20menanyakan%20status%20pesanan%20dengan%20ID%20${job.id}" target="_blank" class="btn btn-outline btn-sm" style="font-weight: 600;">
            <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> Hubungi CS Gilangin
          </a>
        </div>
      </div>
    `;
  }).join("");
}

// Modal Helpers
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
