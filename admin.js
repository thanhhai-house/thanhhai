const API = "https://script.google.com/macros/s/AKfycbzfiyw-8CmWo4SzwGyereCQQog8R5f2sOVa-nCFN_sW-fZZ8ankH1LPqWkoKrrfMtF3Pw/exec";

async function post(data){
  return fetch(API,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(data)
  }).then(r=>r.json());
}
