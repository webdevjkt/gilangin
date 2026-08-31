/**
 * Gilangin - Telegram Notification Module
 * Kirim notifikasi otomatis ke channel Telegram setiap ada pesanan multi-layanan baru
 */

const TELEGRAM_BOT_TOKEN = "8848265959:AAFqDqThx8BbUDp-PBLYVTkox6Iq4CwCDg0";
const TELEGRAM_CHAT_ID   = "-1004298460792";

/**
 * Escape karakter HTML
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatIDR(val) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
}

/**
 * Kirim notifikasi Telegram saat ada pesanan baru (Multi-Service supported)
 * @param {Object} job - data pesanan
 */
function sendTelegramNotification(job) {
  if (!job) return;

  const token  = TELEGRAM_BOT_TOKEN;
  const chatId = TELEGRAM_CHAT_ID;
  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  const items = Array.isArray(job.items) && job.items.length > 0 ? job.items : [
    { name: job.serviceName || job.service, price: job.totalPrice || 75000, groupName: "Layanan" }
  ];

  const itemsListText = items.map((item, idx) => {
    const gName = item.groupName ? `[${escapeHtml(item.groupName)}] ` : "";
    return `  ${idx + 1}. ${gName}<b>${escapeHtml(item.name)}</b> — ${formatIDR(item.price || 0)}`;
  }).join("\n");

  const totalPriceFormatted = formatIDR(job.totalPrice || items.reduce((s, i) => s + (i.price || 0), 0));
  const notes = job.notes ? `\n📝 <b>Catatan:</b> ${escapeHtml(job.notes)}` : "";
  const phone = job.phone ? `\n📱 <b>WA/HP:</b> ${escapeHtml(job.phone)}`  : "";

  const text = [
    `🔔 <b>PESANAN BARU (${items.length} LAYANAN)!</b>`,
    "━━━━━━━━━━━━━━━━━━━━",
    `🆔 <b>ID Tiket:</b> <code>${escapeHtml(job.id || "JOB-NEW")}</code>`,
    `👤 <b>Pelanggan:</b> ${escapeHtml(job.customer || "-")}`,
    phone,
    `📅 <b>Jadwal:</b> ${escapeHtml(job.date || "-")} pukul ${escapeHtml(job.time || "-")} WIB`,
    `📍 <b>Alamat:</b> ${escapeHtml(job.address || "-")}`,
    "\n📋 <b>DAFTAR LAYANAN:</b>",
    itemsListText,
    `\n💰 <b>TOTAL BIAYA:</b> ${totalPriceFormatted}`,
    notes,
    "━━━━━━━━━━━━━━━━━━━━",
    `⏰ ${new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}, ${new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour12: false }).replace(".", ":")} WIB`,
    `🌐 <a href="https://gilangin.click/admin.html">Buka Admin Dashboard</a>`,
  ].filter(Boolean).join("\n");

  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:                  chatId,
      text:                     text,
      parse_mode:               "HTML",
      disable_web_page_preview: true,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        console.log("✅ Notifikasi Telegram terkirim untuk tiket:", job.id);
      } else {
        console.warn("⚠️ Telegram API error:", data.description);
      }
    })
    .catch(err => console.warn("⚠️ Gagal kirim notif Telegram:", err.message));
}

window.sendTelegramNotification = sendTelegramNotification;
