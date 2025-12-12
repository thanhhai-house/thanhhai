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

  return [...list].sort(
