const API="https://script.google.com/macros/s/AKfycbzfiyw-8CmWo4SzwGyereCQQog8R5f2sOVa-nCFN_sW-fZZ8ankH1LPqWkoKrrfMtF3Pw/exec";
let PRODUCTS=[];

async function init(){
  PRODUCTS=await fetch(API+"?path=products").then(r=>r.json());
  renderFilters();
  render(PRODUCTS);
}

function renderFilters(){
  const c=[...new Set(PRODUCTS.map(p=>p.category))];
  const b=[...new Set(PRODUCTS.map(p=>p.brand))];
  c.forEach(x=>fCategory.innerHTML+=`<option>${x}</option>`);
  b.forEach(x=>fBrand.innerHTML+=`<option>${x}</option>`);
}

function render(list){
  products.innerHTML="";
  list.forEach(p=>{
    products.innerHTML+=`
      <a class="card" href="product.html?id=${p.id}">
        <img src="${p.imageUrl}">
        <b>${p.name}</b>
        <div>${p.brand} • ${p.category}</div>
        <div>${p.price.toLocaleString()}đ</div>
      </a>`;
  });
}

fCategory.onchange=fBrand.onchange=()=>{
  render(PRODUCTS.filter(p=>
    (!fCategory.value||p.category===fCategory.value) &&
    (!fBrand.value||p.brand===fBrand.value)
  ));
};

init();
