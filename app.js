const API = "https://script.google.com/macros/s/AKfycbws3KmLRQcpVpKcJuaKsDyLfiUHHm0fiNp3RtK0_WQFIsCdzZHTaQ2-uDD5nxQ7eI26Tg/exec";

fetch(API+"?path=products")
  .then(r=>r.json())
  .then(renderProducts);
