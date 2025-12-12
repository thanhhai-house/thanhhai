const API_URL = "https://script.google.com/macros/s/AKfycbzfiyw-8CmWo4SzwGyereCQQog8R5f2sOVa-nCFN_sW-fZZ8ankH1LPqWkoKrrfMtF3Pw/exec"; // 🔴 dán URL Web App Apps Script của bạn

const $ = (id) => document.getElementById(id);
const fmt = (n) => (Number(n||0)).toLocaleString("vi-VN");

let PRODUCTS = [];

function toast(msg){
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hide");
  setTimeout(()=>t.classList.add("hide"), 2200);
}

async function apiPost(payload){
  const res = await fetch(API_URL, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function loadProducts(){
  const res = await fetch(API_URL + "?path=products", { cache:"no-store" });
  const data = await res.json();
  PRODUCTS = Array.isArray(data) ? data : [];
  renderList(PRODUCTS);
  $("count").textContent = `${PRODUCTS.length} sản phẩm`;
}

function readForm(){
  return {
    id: $("p_id").value.trim(),
    oem: $("p_oem").value.trim(),
    name: $("p_name").value.trim(),
    category: $("p_category").value.trim(),
    brand: $("p_brand").value.trim(),
    info: $("p_info").value.trim(),
    price: Number($("p_price").value || 0),
    stock: Number($("p_stock").value || 0),
    sold: Number($("p_sold").value || 0),
    imageUrl: $("p_imageUrl").value.trim(),
  };
}

function fillForm(p){
  $("p_id").value = p.id || "";
  $("p_oem").value = p.oem || "";
  $("p_name").value = p.name || "";
  $("p_category").value = p.category || "";
  $("p_brand").value = p.brand || "";
  $("p_info").value = p.info || "";
  $("p_price").value = p.price ?? 0;
  $("p_stock").value = p.stock ?? 0;
  $("p_sold").value  = p.sold ?? 0;
  $("p_imageUrl").value = p.imageUrl || "";
  $("imgPreview").src = p.imageUrl || "";
}

function renderList(list){
  const box = $("list");
  box.innerHTML = "";
  list.forEach(p=>{
    const el = document.createElement("div");
    el.className = "pcard";
    el.innerHTML = `
      <img class="pimg" src="${p.imageUrl || "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=60"}" onerror="this.src='https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=900&q=60'">
      <div class="pbody">
        <div class="ptitle">${p.name || "-"}</div>
        <div class="pmeta">
          <span class="tag">ID: <b>${p.id||"-"}</b></span>
          <span class="tag">OEM: <b>${p.oem||"-"}</b></span>
          <span class="tag">${p.brand||"-"}</span>
          <span class="tag">${p.category||"Khác"}</span>
        </div>
        <div class="pprice">
          <div class="price">${fmt(p.price)}đ</div>
          <div class="small">Tồn ${fmt(p.stock)} • Bán ${fmt(p.sold)}</div>
        </div>
      </div>
    `;
    el.addEventListener("click", ()=>fillForm(p));
    box.appendChild(el);
  });
}

function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ===== EVENTS =====
$("btnReload").addEventListener("click", async ()=>{
  await loadProducts();
  toast("Đã tải dữ liệu");
});

$("quickQ").addEventListener("input", ()=>{
  const q = $("quickQ").value.trim().toLowerCase();
  if (!q) return renderList(PRODUCTS);
  const filtered = PRODUCTS.filter(p=>{
    const hay = `${p.id} ${p.oem} ${p.name} ${p.brand} ${p.category}`.toLowerCase();
    return hay.includes(q);
  });
  renderList(filtered);
});

$("imgFile").addEventListener("change", async ()=>{
  const f = $("imgFile").files[0];
  if (!f) return;
  const dataUrl = await fileToDataUrl(f);
  $("imgPreview").src = dataUrl;
});

$("btnUpload").addEventListener("click", async ()=>{
  const f = $("imgFile").files[0];
  if (!f) return alert("Chọn ảnh trước");

  const dataUrl = await fileToDataUrl(f);
  $("imgPreview").src = dataUrl;

  const out = await apiPost({ path:"upload", filename: f.name, base64: dataUrl });
  if (!out.ok) return alert(out.error || "Upload lỗi");

  $("p_imageUrl").value = out.imageUrl;
  $("imgPreview").src = out.imageUrl;
  toast("Upload ảnh OK");
});

$("btnSave").addEventListener("click", async ()=>{
  const data = readForm();
  if (!data.id || !data.oem || !data.name) return alert("Thiếu: id / oem / name");

  const out = await apiPost({ path:"product/save", data });
  if (!out.ok) return alert(out.error || "Lưu lỗi");

  toast("Đã lưu sản phẩm");
  await loadProducts();
});

$("btnDelete").addEventListener("click", async ()=>{
  const id = $("p_id").value.trim();
  if (!id) return alert("Nhập ID cần xoá");
  if (!confirm("Xoá sản phẩm này?")) return;

  const out = await apiPost({ path:"product/delete", id });
  if (!out.ok) return alert(out.error || "Xoá lỗi");

  toast("Đã xoá");
  await loadProducts();
});

$("btnAddBrand").addEventListener("click", async ()=>{
  const name = $("newBrand").value.trim();
  if (!name) return alert("Nhập brand");
  const out = await apiPost({ path:"brand/add", name });
  if (!out.ok) return alert(out.error || "Lỗi");
  toast(out.existed ? "Brand đã tồn tại" : "Đã thêm brand");
  $("newBrand").value = "";
});

$("btnAddCat").addEventListener("click", async ()=>{
  const name = $("newCat").value.trim();
  if (!name) return alert("Nhập category");
  const out = await apiPost({ path:"category/add", name });
  if (!out.ok) return alert(out.error || "Lỗi");
  toast(out.existed ? "Category đã tồn tại" : "Đã thêm category");
  $("newCat").value = "";
});

$("btnIn").addEventListener("click", async ()=>{
  const id = $("mv_id").value.trim();
  const qty = Number($("mv_qty").value || 0);
  const note = $("mv_note").value.trim();
  if (!id || qty <= 0) return alert("Nhập productId và qty > 0");

  const out = await apiPost({ path:"stock/in", id, qty, note });
  if (!out.ok) return alert(out.error || "Lỗi nhập kho");

  toast(`Nhập kho OK. Tồn mới: ${out.stock}`);
  await loadProducts();
});

$("btnOut").addEventListener("click", async ()=>{
  const id = $("mv_id").value.trim();
  const qty = Number($("mv_qty").value || 0);
  const note = $("mv_note").value.trim();
  if (!id || qty <= 0) return alert("Nhập productId và qty > 0");

  const out = await apiPost({ path:"stock/out", id, qty, note });
  if (!out.ok) return alert(out.error || "Lỗi xuất bán");

  toast(`Xuất bán OK. Tồn: ${out.stock} | Bán: ${out.sold}`);
  await loadProducts();
});

$("btnHistory").addEventListener("click", async ()=>{
  const q = $("his_q").value.trim();
  const limit = Number($("his_limit").value || 200);

  const out = await apiPost({ path:"history", q, limit });
  if (!out.ok) return alert(out.error || "Lỗi tải lịch sử");

  const lines = out.items.map(x =>
    `${x.ts} | ${x.type} | ${x.productId} | OEM:${x.oem} | qty:${x.qty} | price:${x.price} | by:${x.userEmail}\nnote: ${x.note}\n---`
  ).join("\n");

  $("his_box").textContent = lines || "(Trống)";
});

// ===== INIT =====
(async function init(){
  try{
    await loadProducts();
  }catch(e){
    alert("Không tải được dữ liệu. Kiểm tra API_URL hoặc quyền deploy Apps Script.\n" + (e.message || e));
  }
})();
