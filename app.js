const API = "https://script.google.com/macros/s/AKfycbzfiyw-8CmWo4SzwGyereCQQog8R5f2sOVa-nCFN_sW-fZZ8ankH1LPqWkoKrrfMtF3Pw/exec";
let PRODUCTS = [];

async function init(){
  PRODUCTS = await fetch(API + "?path=products&t=" + Date.now())
    .then(r => r.json());

  if (!Array.isArray(PRODUCTS)) {
    console.error("DATA KHÔNG HỢP LỆ", PRODUCTS);
    PRODUCTS = [];
  }

  renderFilters();
  render(PRODUCTS);
}

function renderFilters(){
  const cats = [...new Set(PRODUCTS.map(p => p.category || "Khác"))];
  const brands = [...new Set(PRODUCTS.map(p => p.brand || "Không rõ"))];

  fCategory.innerHTML = `<option value="">Tất cả loại</option>`;
  fBrand.innerHTML = `<option value="">Tất cả thương hiệu</option>`;

  cats.forEach(c => fCategory.innerHTML += `<option>${c}</option>`);
  brands.forEach(b => fBrand.innerHTML += `<option>${b}</option>`);
}

function render(list){
  products.innerHTML = "";
  list.forEach(p => {
    products.innerHTML += `
      <a class="card" href="product.html?id=${p.id}">
        <img src="${p.imageUrl || 'https://via.placeholder.com/300'}">
        <b>${p.name}</b>
        <div>${p.brand || "Không rõ"} • ${p.category || "Khác"}</div>
        <div>${Number(p.price).toLocaleString()}đ</div>
      </a>`;
  });
}

fCategory.onchange = fBrand.onchange = () => {
  render(PRODUCTS.filter(p =>
    (!fCategory.value || (p.category || "Khác") === fCategory.value) &&
    (!fBrand.value || (p.brand || "Không rõ") === fBrand.value)
  ));
};

init();
