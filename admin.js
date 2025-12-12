const API="https://script.google.com/macros/s/AKfycbzfiyw-8CmWo4SzwGyereCQQog8R5f2sOVa-nCFN_sW-fZZ8ankH1LPqWkoKrrfMtF3Pw/exec";
let imageUrl="";

const b64=f=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f);});

async function upload(){
  const f=img.files[0];
  const out=await fetch(API,{method:"POST",headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path:"upload",filename:f.name,base64:await b64(f)})}).then(r=>r.json());
  imageUrl=out.imageUrl;
  alert("Upload OK");
}

async function save(){
  await fetch(API,{method:"POST",headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path:"product/save",
      data:{id:id.value,oem:oem.value,name:name.value,
      brand:brand.value,category:category.value,
      price:+price.value,stock:+stock.value,sold:0,imageUrl}})});
  alert("Đã lưu");
}

async function stockIn(){
  await fetch(API,{method:"POST",headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path:"stock/in",id:id.value,qty:+qty.value})});
  alert("Nhập kho OK");
}

async function stockOut(){
  await fetch(API,{method:"POST",headers:{'Content-Type':'application/json'},
    body:JSON.stringify({path:"stock/out",id:id.value,qty:+qty.value})});
  alert("Xuất bán OK");
}
