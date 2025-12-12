const API = "https://script.google.com/macros/s/AKfycbzfiyw-8CmWo4SzwGyereCQQog8R5f2sOVa-nCFN_sW-fZZ8ankH1LPqWkoKrrfMtF3Pw/exec";

fetch(API+"?path=products")
  .then(r=>r.json())
  .then(data=>{
    const box=document.getElementById("products");
    data.forEach(p=>{
      box.innerHTML+=`
        <div class="card">
          <img src="${p.imageUrl||'https://via.placeholder.com/300'}">
          <b>${p.name}</b>
          <div>${p.brand} • ${p.category}</div>
          <div>${p.price.toLocaleString()}đ</div>
          <small>Tồn:${p.stock} | Bán:${p.sold}</small>
        </div>`;
    });
  });
