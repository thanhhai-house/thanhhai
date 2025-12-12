const DB_URL = "./data/products.json";
let ALL = [];

let state = {
  q: "",
  partType: "all",
  brand: "all",
  stock: "all",
  minPrice: "",
  maxPrice: "",
  sortBy: "updatedDesc",
};

const $ = (id) => document.getElementById(id);
const fmt = (n) => (Number(n || 0)).toLocaleString("vi-VN");

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hide");
  setTimeout(()=>t.classList.add("hide"), 2200);
}

function escapeHtml(str){
  return String(str||"").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

async function loadProducts(){
  const res = await fetch(DB_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Không tải được data/products.json (kiểm tra đường dẫn + tên file)");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("products.json phải là mảng []");
  return data;
}

function normalize(p){
  const img = String(p.image || "");
  const image = img && !img.startsWith("http") && !img.startsWith("./")
    ? "./" + img.replace(/^\//, "")
    : img;

  return {
    id: String(p.id || ""),
    oem: String(p.oem || ""),
    brand: String(p.brand || ""),
    partType: String(p.partType || "Khác"), // ✅ dùng partType
    name: String(p.name || ""),
    info: String(p.info || ""),
    price: Number(p.price || 0),
    stock: Number(p.stock || 0),
    sold: Number(p.sold || 0),
    image: image || "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=60",
    updatedAt: String(p.updatedAt || "")
  };
}

function uniq(arr){
  return Array.from(new Set(arr.map(x => String(x||"").trim()).filter(Boolean)))
    .sort((a,b)=>a.localeCompare(b));
}

function kpis(){
  const total = ALL.length;
  const totalStock = ALL.reduce((s,p)=>s+(p.stock||0),0);
  const totalSold = ALL.reduce((s,p)=>s+(p.sold||0),0);
  $("kpiTotal").textContent = `${fmt(total)} SP`;
  $("kpiStock").textContent = `${fmt(totalStock)} tồn`;
  $("kpiSold").textContent = `${fmt(totalSold)} bán`;
}

function buildFilters(){
  const cats = uniq(ALL.map(p => p.partType));
  const brands = uniq(ALL.map(p => p.brand));

  $("catFilter").innerHTML =
    `<option value="all">Tất cả</option>` + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  $("brandFilter").innerHTML =
    `<option value="all">Tất cả</option>` + brands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");

  // Mega categories
  const megaCats = $("megaCats");
  megaCats.innerHTML = "";
  cats.forEach(c => {
    const el = document.createElement("div");
    el.className = "megaItem";
    el.innerHTML = `<span>${escapeHtml(c)}</span><span class="small">${fmt(ALL.filter(p=>p.partType===c).length)}</span>`;
    el.addEventListener("click", ()=>{
      state.partType = c;
      syncUI();
      doSearch();
      closeMega();
    });
    megaCats.appendChild(el);
  });

  // Mega brands
  const megaBrands = $("megaBrands");
  megaBrands.innerHTML = "";
  brands.forEach(b => {
    const el = document.createElement("button");
    el.className = "chip";
    el.textContent = b;
    el.addEventListener("click", ()=>{
      state.brand = b;
      syncUI();
      doSearch();
      closeMega();
    });
    megaBrands.appendChild(el);
  });

  // Sidebar quick brand
  const chipWrap = $("brandChips");
  chipWrap.innerHTML = "";
  brands.slice(0, 18).forEach(b => {
    const el = document.createElement("button");
    el.className = "chip";
    el.textContent = b;
    el.addEventListener("click", ()=>{
      state.brand = b;
      syncUI();
      doSearch();
    });
    chipWrap.appendChild(el);
  });
}

function badgeStock(stock){
  if (stock <= 0) return `<span class="tag bad">Hết hàng</span>`;
  if (stock <= 3) return `<span class="tag warn">Sắp hết</span>`;
  return `<span class="tag good">Còn hàng</span>`;
}

function applyFilters(items){
  let list = items;

  const q = state.q.trim().toLowerCase();
  if (q){
    list = list.filter(p => {
      const hay = `${p.oem} ${p.brand} ${p.partType} ${p.name} ${p.info}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (state.partType !== "all") list = list.filter(p => p.partType === state.partType);
  if (state.brand !== "all") list = list.filter(p => p.brand === state.brand);

  if (state.stock === "in") list = list.filter(p => p.stock > 0);
  if (state.stock === "out") list = list.filter(p => p.stock <= 0);
  if (state.stock === "low") list = list.filter(p => p.stock > 0 && p.stock <= 3);

  const minP = Number(state.minPrice || 0);
  const maxP = Number(state.maxPrice || 0);
  if (minP > 0) list = list.filter(p => p.price >= minP);
  if (maxP > 0) list = list.filter(p => p.price <= maxP);

  const sorters = {
    updatedDesc: (a,b)=> String(b.updatedAt).localeCompare(String(a.updatedAt)),
    priceAsc: (a,b)=> (a.price||0) - (b.price||0),
    priceDesc: (a,b)=> (b.price||0) - (a.price||0),
    stockDesc: (a,b)=> (b.stock||0) - (a.stock||0),
    soldDesc: (a,b)=> (b.sold||0) - (a.sold||0),
    nameAsc: (a,b)=> String(a.name||"").localeCompare(String(b.name||"")),
  };

  return [...list].sort(sorters[state.sortBy] || sorters.updatedDesc);
}

function render(list){
  $("resultCount").textContent = `${fmt(list.length)} kết quả`;
  $("hint").textContent = `Đang lọc: Danh mục=${state.partType} • Brand=${state.brand} • Tồn=${state.stock}`;

  const grid = $("grid");
  grid.innerHTML = "";

  list.forEach(p => {
    const el = document.createElement("div");
    el.className = "pcard";
    el.innerHTML = `
      <img class="pimg" src="${p.image}" alt="" onerror="this.src='https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=60'">
      <div class="pbody">
        <div class="ptitle">${escapeHtml(p.name || "-")}</div>
        <div class="pmeta">
          <span class="tag">OEM: <b>${escapeHtml(p.oem||"-")}</b></span>
          <span class="tag">Brand: <b>${escapeHtml(p.brand||"-")}</b></span>
          <span class="tag">${escapeHtml(p.partType||"Khác")}</span>
          ${badgeStock(p.stock)}
        </div>
        <div class="pprice">
          <div class="price">${fmt(p.price)}đ</div>
          <div class="small">Tồn ${fmt(p.stock)} • Bán ${fmt(p.sold)}</div>
        </div>
      </div>
    `;
    el.addEventListener("click", ()=>openModal(p));
    grid.appendChild(el);
  });
}

function openModal(p){
  $("modal").classList.remove("hide");
  $("mTitle").textContent = p.name || "Chi tiết";

  $("modalBody").innerHTML = `
    <img class="detailImg" src="${p.image}" alt="" onerror="this.src='https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=60'">
    <div class="hr"></div>

    <div class="pmeta">
      <span class="tag">OEM: <b id="oemText">${escapeHtml(p.oem||"-")}</b></span>
      <span class="tag">Brand: <b id="brandText">${escapeHtml(p.brand||"-")}</b></span>
      <span class="tag">Danh mục: <b id="typeText">${escapeHtml(p.partType||"Khác")}</b></span>
      ${badgeStock(p.stock)}
    </div>

    <div class="hr"></div>

    <div class="pprice">
      <div class="price">${fmt(p.price)}đ</div>
      <div class="small">Updated: ${escapeHtml(p.updatedAt||"-")}</div>
    </div>

    <div class="hr"></div>
    <div class="muted" style="font-size:13px; line-height:1.55" id="infoText">
      ${escapeHtml(p.info || "Không có mô tả.")}
    </div>

    <div class="hr"></div>

    <div class="pmeta">
      <span class="tag">Tồn: <b>${fmt(p.stock)}</b></span>
      <span class="tag">Đã bán: <b>${fmt(p.sold)}</b></span>
      <span class="tag">ID: <b>${escapeHtml(p.id)}</b></span>
    </div>
  `;

  $("copyOEM").onclick = async () => {
    await navigator.clipboard.writeText(p.oem || "");
    toast("Đã copy OEM");
  };
  $("copyName").onclick = async () => {
    await navigator.clipboard.writeText(p.name || "");
    toast("Đã copy Tên");
  };
  $("copyAll").onclick = async () => {
    const text = `OEM: ${p.oem}\nBrand: ${p.brand}\nDanh mục: ${p.partType}\nTên: ${p.name}\nGiá: ${p.price}\nTồn: ${p.stock}\nBán: ${p.sold}\nInfo: ${p.info}`;
    await navigator.clipboard.writeText(text);
    toast("Đã copy Thông tin");
  };
}

function closeModal(){ $("modal").classList.add("hide"); }

/* Mega menu */
function openMega(){ $("mega").classList.remove("hide"); $("catBtn").setAttribute("aria-expanded","true"); }
function closeMega(){ $("mega").classList.add("hide"); $("catBtn").setAttribute("aria-expanded","false"); }
function toggleMega(){ $("mega").classList.contains("hide") ? openMega() : closeMega(); }

/* Search */
function doSearch(){
  // read UI -> state
  state.q = $("q").value;
  state.partType = $("catFilter").value;
  state.brand = $("brandFilter").value;
  state.stock = $("stockFilter").value;
  state.minPrice = $("minPrice").value;
  state.maxPrice = $("maxPrice").value;
  state.sortBy = $("sortBy").value;

  const list = applyFilters(ALL);
  render(list);
}

function syncUI(){
  $("q").value = state.q;
  $("catFilter").value = state.partType;
  $("brandFilter").value = state.brand;
  $("stockFilter").value = state.stock;
  $("minPrice").value = state.minPrice;
  $("maxPrice").value = state.maxPrice;
  $("sortBy").value = state.sortBy;
}

/* Events */
$("applyBtn").addEventListener("click", doSearch);
$("resetBtn").addEventListener("click", ()=>{
  state = { q:"", partType:"all", brand:"all", stock:"all", minPrice:"", maxPrice:"", sortBy:"updatedDesc" };
  syncUI(); doSearch();
});

$("reloadBtn").addEventListener("click", async ()=>{
  try{
    ALL = (await loadProducts()).map(normalize);
    buildFilters();
    kpis();
    doSearch();
    toast("Đã tải lại dữ liệu.");
  }catch(e){ toast(e.message || String(e)); }
});

$("q").addEventListener("input", ()=>{
  clearTimeout(window.__t);
  window.__t = setTimeout(doSearch, 180);
});
$("clearQ").addEventListener("click", ()=>{
  $("q").value = "";
  doSearch();
});

["catFilter","brandFilter","stockFilter","sortBy"].forEach(id=>{
  $(id).addEventListener("change", doSearch);
});
["minPrice","maxPrice"].forEach(id=>{
  $(id).addEventListener("input", ()=>{
    clearTimeout(window.__t2);
    window.__t2 = setTimeout(doSearch, 250);
  });
});

$("catBtn").addEventListener("click", toggleMega);
document.addEventListener("click", (e)=>{
  const mega = $("mega");
  const btn = $("catBtn");
  if (mega.classList.contains("hide")) return;
  if (mega.contains(e.target) || btn.contains(e.target)) return;
  closeMega();
});

$("modalClose").addEventListener("click", closeModal);
$("modalX").addEventListener("click", closeModal);
document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeModal(); });

/* Init */
(async function init(){
  try{
    ALL = (await loadProducts()).map(normalize);
    buildFilters();
    kpis();
    doSearch();
  }catch(e){
    toast(e.message || String(e));
  }
})();
