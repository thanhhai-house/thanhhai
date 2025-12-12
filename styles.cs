:root{--bg:#0b1220;--card:#111a2e;--muted:#8aa0c6;--text:#e8f0ff;--line:#223052;--accent:#4ea1ff;}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;background:linear-gradient(180deg,#070b14,#0b1220);color:var(--text)}
.top{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:14px 18px;position:sticky;top:0;background:rgba(7,11,20,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.brand{font-weight:900;letter-spacing:.2px}
.tabs{display:flex;gap:8px;flex-wrap:wrap}
.tab{border:1px solid var(--line);background:transparent;color:var(--text);padding:10px 12px;border-radius:14px;cursor:pointer;text-decoration:none}
.tab.active{background:var(--accent);border-color:transparent;color:#061126}
.tab.link{display:inline-flex;align-items:center}
.wrap{max-width:1100px;margin:0 auto;padding:18px}
.grid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:900px){.grid.two{grid-template-columns:1.2fr .8fr}}
.card{background:rgba(17,26,46,.92);border:1px solid var(--line);border-radius:18px;padding:14px;box-shadow:0 12px 34px rgba(0,0,0,.25)}
.row{display:flex;gap:10px;flex-wrap:wrap}
.field{display:flex;flex-direction:column;gap:6px;flex:1;min-width:180px}
label{font-size:12px;color:var(--muted)}
input{background:#0b1428;border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:14px;outline:none}
input:focus{border-color:rgba(78,161,255,.7)}
.btn{background:var(--accent);border:none;color:#061126;padding:10px 12px;border-radius:14px;cursor:pointer;font-weight:800}
.btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text)}
.muted{color:var(--muted);font-size:12px}
.split{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.title{font-weight:900}
.title.s14{font-size:14px}
.list{display:flex;flex-direction:column;gap:10px}
.item{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--line);border-radius:16px;padding:10px;background:#0b1428}
.thumb{width:72px;height:72px;border-radius:14px;border:1px solid var(--line);object-fit:cover;background:#091024}
.meta{flex:1;min-width:240px}
.pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.pill{display:inline-flex;gap:6px;align-items:center;padding:4px 8px;border:1px solid var(--line);border-radius:999px;color:var(--muted);font-size:12px}
.hide{display:none}
.mt8{margin-top:8px}
.mt12{margin-top:12px}
.flex2{flex:2;min-width:260px}
.w160{min-width:160px}
.kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:700px){.kpis{grid-template-columns:repeat(4,1fr)}}
.kpi{padding:12px;border-radius:16px;border:1px solid var(--line);background:#0b1428}
.kpi .v{font-weight:1000;font-size:18px;margin-top:4px}
.tableWrap{overflow:auto}
table{width:100%;border-collapse:separate;border-spacing:0 8px}
th,td{font-size:13px;text-align:left;padding:10px 10px}
th{color:var(--muted);font-weight:800}
tbody tr{background:#0b1428;border:1px solid var(--line)}
tbody tr td:first-child, thead tr th:first-child{border-top-left-radius:14px;border-bottom-left-radius:14px}
tbody tr td:last-child, thead tr th:last-child{border-top-right-radius:14px;border-bottom-right-radius:14px}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#0b1428;border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:14px;min-width:240px;max-width:90vw}

