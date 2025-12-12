const DB_URL = "./data/products.json";
let ALL = [];

const $ = (id) => document.getElementById(id);
const fmt = (n) => (Number(n || 0)).toLocaleString("vi-VN");

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hide");
  setTimeout(() => t.classList.add("hide"), 2200);
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

async function loadProducts() {
  const res = await fetch(DB_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Không tải được products.json");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json phải là mảng []");
  return data;
}

function normalize(p) {
  // đảm bảo ảnh chạy đúng khi đặt path tương đối trong JSON
  const img = String(p.image || "");
  const image = img && !img.startsWith("http") && !img.startsWith("./")
    ? "./" + img.replace(/^\//, "")
    : img;

  return {
    id: String(p.id || ""),
    sku: String(p.sku || ""),
    barcode: String(p.barcode || ""),
    name: String(p.name || ""),
    category: String(p.category || "Khác"),
    price: Number(p.price || 0),
    cost: Number(p.cost || 0),
    stock: Number(p.stock || 0),
    image,
    updatedAt: String(p.updatedAt || "")
  };
}

function renderResults(list) {
  const box = $("results");
  box.innerHTML = "";
  $("detail").innerHTML = "";

  if (!list.length) {
    box.innerHTML = `<div class="muted">Không có kết quả.</div>`;
    return;
  }

  for (const p of list) {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      ${p.image ? `<img class="thumb" src="${p.image}" onerror="this.style.display='none'">` : `<div class="thumb"></div>`}
      <div class="meta">
        <div class="title">${escapeHtml(p.name)}</div>
        <div class="pills">
          <span class="pill">SKU: ${escapeHtml(p.sku || "-")}</span>
          <span class="pill">Barcode: ${escapeHtml(p.barcode || "-")}</span>
          <span class="pill">Danh mục: ${escapeHtml(p.category || "Khác")}</span>
        </div>
        <div class="muted mt8">Giá: <b>${fmt(p.price)}</b> | Tồn: <b>${fmt(p.stock)}</b></div>
      </div>
      <div><button class="btn ghost">Xem</button></div>
    `;
    el.querySelector("button").addEventListener("click", () => renderDetail(p));
    box.appendChild(el);
  }
}

function renderDetail(p) {
  $("detail").innerHTML = `
    <div class="row">
      ${p.image ? `<img class="thumb" style="width:120px;height:120px" src="${p.image}" onerror="this.style.display='none'">` : `<div class="thumb" style="width:120px;height:120px"></div>`}
      <div style="flex:1;min-width:240px">
        <div class="title">${escapeHtml(p.name)}</div>
        <div class="muted">id: ${escapeHtml(p.id)}</div>
        <div class="muted">SKU: ${escapeHtml(p.sku || "-")} • Barcode: ${escapeHtml(p.barcode || "-")}</div>
        <div class="muted">Danh mục: ${escapeHtml(p.category || "Khác")}</div>
        <div class="muted mt8">Giá: <b>${fmt(p.price)}</b> • Giá vốn: <b>${fmt(p.cost)}</b> • Tồn: <b>${fmt(p.stock)}</b></div>
        <div class="muted mt8">Updated: ${escapeHtml(p.updatedAt || "-")}</div>
      </div>
    </div>
  `;
}

function doSearch() {
  const q = $("q").value.trim().toLowerCase();
  const list = !q ? ALL : ALL.filter(p => {
    const hay = `${p.sku} ${p.barcode} ${p.name} ${p.category}`.toLowerCase();
    return hay.includes(q);
  });

  list.sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  renderResults(list.slice(0, 200));
}

function computeStats(items) {
  let totalProducts = items.length;
  let totalStock = 0;
  let stockValueByPrice = 0;
  let stockValueByCost = 0;

  const byCategory = new Map();
  for (const p of items) {
    totalStock += p.stock;
    stockValueByPrice += p.stock * p.price;
    stockValueByCost += p.stock * p.cost;

    const key = p.category || "Khác";
    const cur = byCategory.get(key) || { category: key, count: 0, stock: 0 };
    cur.count += 1;
    cur.stock += p.stock;
    byCategory.set(key, cur);
  }

  const rows = [...byCategory.values()].sort((a,b)=>b.stock-a.stock);
  return { totalProducts, totalStock, stockValueByPrice, stockValueByCost, byCategory: rows };
}

function renderStats() {
  const s = computeStats(ALL);
  $("k_total").textContent = fmt(s.totalProducts);
  $("k_stock").textContent = fmt(s.totalStock);
  $("k_value_price").textContent = fmt(s.stockValueByPrice);
  $("k_value_cost").textContent = fmt(s.stockValueByCost);

  const body = $("cat_rows");
  body.innerHTML = "";
  for (const r of s.byCategory) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(r.category)}</td><td>${fmt(r.count)}</td><td>${fmt(r.stock)}</td>`;
    body.appendChild(tr);
  }
}

// Tabs
document.querySelectorAll(".tab[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    ["lookup","stats"].forEach(x => $("tab-"+x).classList.toggle("hide", x !== tab));
    if (tab === "stats") renderStats();
  });
});

// Events
$("btnReload").addEventListener("click", async () => {
  try {
    ALL = (await loadProducts()).map(normalize);
    toast("Đã tải lại dữ liệu.");
    doSearch();
  } catch (e) { toast(e.message || String(e)); }
});

$("btnSearch").addEventListener("click", doSearch);
$("q").addEventListener("input", () => {
  clearTimeout(window.__t);
  window.__t = setTimeout(doSearch, 180);
});

$("btnStats").addEventListener("click", renderStats);

// Init
(async function init(){
  try {
    ALL = (await loadProducts()).map(normalize);
    doSearch();
  } catch (e) {
    toast(e.message || String(e));
  }
})();
