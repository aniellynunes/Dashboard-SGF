const ST=["Disponível","Em operação","Em transporte","Descartada"];
const NEXT=["Iniciar operação","Solicitar retirada","Registrar descarte"];
const CKEY="sgf-residuos-transportadoras-v1";
function loadCars(){try{const r=JSON.parse(localStorage.getItem(CKEY));if(Array.isArray(r)&&r.length)return r}catch(e){}return ["EcoTrans","LimpaFácil","CaçambaRápida","VerdeLog"]}
let CARS=loadCars();
const TIPOS=["Entulho","Madeira","Metal","Plástico","Papel","Orgânico"];
const DEST={"Reciclagem":1,"Reuso":1,"Aterro Classe A":0,"Aterro sanitário":0,"Coprocessamento":0.5};
const CO2=0.4; // kg CO2e evitado por kg reciclado (estimativa)
const KEY="sgf-residuos-v1";
let tab="painel",cur=null,data=load();

function seed(){
  const d=n=>new Date(Date.now()-n*864e5).toISOString();
  const mk=(i,c,o,t,v,s,p,de,days)=>({id:"CX-"+(100+i),carrier:c,obra:o,tipo:t,vol:v,status:s,peso:p||0,destino:de||"",
    hist:ST.slice(0,ST.indexOf(s)+1).map((x,k)=>({s:x,d:d(days-k*2)}))});
  return [
    mk(1,CARS[0],"Residencial Vila Verde","Entulho",5,"Descartada",3200,"Reciclagem",12),
    mk(2,CARS[0],"Shopping Norte","Madeira",7,"Descartada",900,"Reuso",10),
    mk(3,CARS[1],"Ed. Aurora","Entulho",5,"Descartada",4100,"Aterro Classe A",9),
    mk(4,CARS[1],"Reforma Escola Municipal","Metal",4,"Descartada",1500,"Reciclagem",8),
    mk(5,CARS[2],"Condomínio Bosque","Plástico",7,"Em transporte",0,"",4),
    mk(6,CARS[2],"Galpão Logístico","Papel",5,"Em operação",0,"",3),
    mk(7,CARS[3],"Hospital Central","Orgânico",4,"Descartada",800,"Coprocessamento",6),
    mk(8,CARS[3],"Ed. Aurora","Entulho",5,"Em operação",0,"",2),
    mk(9,CARS[0],"Praça das Flores","Madeira",5,"Disponível",0,"",0),
    mk(10,CARS[1],"Residencial Vila Verde","Metal",7,"Em transporte",0,"",2)
  ];
}
function load(){try{const r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);d.forEach(c=>{if(c.status==="Em obra")c.status="Em operação";(c.hist||[]).forEach(h=>{if(h.s==="Em obra")h.s="Em operação"})});return d}}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("pt-BR");
const dt=i=>new Date(i).toLocaleDateString("pt-BR");
const opts=(a,sel)=>a.map(x=>`<option${x===sel?" selected":""}>${esc(x)}</option>`).join("");

function stats(list){
  const done=list.filter(c=>c.status==="Descartada");
  const peso=done.reduce((a,c)=>a+c.peso,0);
  const rec=done.reduce((a,c)=>a+c.peso*(DEST[c.destino]||0),0);
  return{total:list.length,ativas:list.filter(c=>c.status!=="Descartada").length,transp:list.filter(c=>c.status==="Em transporte").length,done:done.length,peso,rec,taxa:peso?rec/peso*100:0,co2:rec*CO2};
}

const TABS=[["painel","Painel"],["cacambas","Caçambas"],["transp","Transportadoras"]];
function renderTabs(){$("#tabs").innerHTML=TABS.map(([k,n])=>`<button class="${k===tab?"on":""}" data-tab="${k}">${n}</button>`).join("")}

function painel(){
  const s=stats(data),cnt=ST.map(x=>data.filter(c=>c.status===x).length);
  const byT=TIPOS.map(t=>[t,data.filter(c=>c.status==="Descartada"&&c.tipo===t).reduce((a,c)=>a+c.peso,0)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]);
  const max=byT.length?byT[0][1]:1;
  return `<div class="grid kpis">
    <div class="card kpi"><small>Caçambas ativas</small><b>${s.ativas}</b></div>
    <div class="card kpi"><small>Caçambas descartadas</small><b>${s.done}</b></div>
    <div class="card kpi"><small>Em transporte</small><b>${s.transp}</b></div>
    <div class="card kpi"><small>Transporte concluído</small><b>${s.done}</b></div>
    <div class="card kpi"><small>Total descartado</small><b>${fmt(s.peso)} kg</b></div>
  </div>
  <div class="grid two">
    <div class="card"><h2>Situação da frota</h2>
      <div class="bar">${cnt.map((n,i)=>`<i class="s${i}" style="width:${n/data.length*100}%"></i>`).join("")}</div>
      <div class="leg">${ST.map((x,i)=>`<span><span class="dot s${i}"></span>${x}: ${cnt[i]}</span>`).join("")}</div></div>
    <div class="card"><h2>Peso descartado por tipo</h2>
      ${byT.map(([t,p])=>`<div class="row"><div class="l"><span>${t}</span><span>${fmt(p)} kg</span></div><div class="bar"><i class="s3" style="width:${p/max*100}%"></i></div></div>`).join("")||'<div class="empty">Sem descartes</div>'}</div>
  </div>`;
}

function cacambas(){
  const f=window.F||(window.F={q:"",st:"",car:""});
  const list=data.filter(c=>(!f.st||c.status===f.st)&&(!f.car||c.carrier===f.car)&&(!f.q||(c.id+c.obra+c.tipo).toLowerCase().includes(f.q.toLowerCase())));
  return `<div class="filters">
    <input id="fq" placeholder="Buscar código, obra ou resíduo" value="${esc(f.q)}">
    <select id="fs"><option value="">Todos os status</option>${opts(ST,f.st)}</select>
    <select id="fc"><option value="">Todas as transportadoras</option>${opts(CARS,f.car)}</select></div>
  <div class="grid list">${list.map(card).join("")||'<div class="empty">Nenhuma caçamba encontrada.</div>'}</div>`;
}
function card(c){
  const i=ST.indexOf(c.status);
  return `<div class="card"><div class="ch"><div><b>${c.id}</b> · ${esc(c.tipo)}<div class="meta">${esc(c.obra)}</div></div><span class="tag s${i}">${c.status}</span></div>
  <div class="meta">🚚 ${esc(c.carrier)}${c.peso?` · ${fmt(c.peso)} kg → ${esc(c.destino)}`:""}</div>
  <div class="steps">${ST.map((_,k)=>`<i class="${k<=i?"s"+i:""}"></i>`).join("")}</div>
  <div class="acts">${i<3?`<button class="btn sm" data-next="${c.id}">${NEXT[i]}</button>`:""}<button class="btn sm sec" data-h="${c.id}">Histórico</button></div>
  <ul class="hist" id="h-${c.id}" hidden>${c.hist.map(h=>`<li>${h.s} – ${dt(h.d)}</li>`).join("")}</ul></div>`;
}

function transp(){
  return `<div class="acts" style="margin-bottom:12px"><button class="btn" data-addcar>+ Nova transportadora</button></div><div class="grid list">${CARS.map(n=>{
    const l=data.filter(c=>c.carrier===n),s=stats(l);
    return `<div class="card"><h2>🚚 ${esc(n)}</h2>
    <div class="meta">${s.total} caçambas · ${s.ativas} ativas · ${s.done} descartadas</div>
    <div class="meta">Em transporte: <b>${s.transp}</b><br>Transporte concluído: <b>${s.done}</b><br>Total descartado: <b>${fmt(s.peso)} kg</b></div></div>`}).join("")}</div>`;
}

function render(){renderTabs();$("#app").innerHTML=({painel,cacambas,transp})[tab]()}

document.addEventListener("click",e=>{
  const t=e.target.closest("[data-tab],[data-next],[data-h],[data-close],[data-addcar]");if(!t)return;
  if(t.dataset.addcar!==undefined){$("#cNome").value="";$("#cErr").textContent="";$("#dCar").showModal();$("#cNome").focus()}
  else if(t.dataset.tab){tab=t.dataset.tab;render()}
  else if(t.dataset.close!==undefined)t.closest("dialog").close();
  else if(t.dataset.h){const u=$("#h-"+t.dataset.h);u.hidden=!u.hidden}
  else if(t.dataset.next){
    cur=data.find(c=>c.id===t.dataset.next);
    if(cur.status==="Em transporte"){$("#dInfo").textContent=`${cur.id} · ${cur.carrier} · ${cur.tipo}`;$("#dPeso").value="";$("#dDest").innerHTML=opts(Object.keys(DEST));$("#dDes").showModal()}
    else advance()
  }
});
document.addEventListener("input",e=>{
  const id=e.target.id;if(!["fq","fs","fc"].includes(id))return;
  F.q=$("#fq").value;F.st=$("#fs").value;F.car=$("#fc").value;
  const p=e.target.selectionStart;render();const n=$("#"+id);n.focus();if(p!=null&&n.setSelectionRange&&n.tagName==="INPUT")n.setSelectionRange(p,p)
});
function advance(extra){
  cur.status=ST[ST.indexOf(cur.status)+1];Object.assign(cur,extra||{});
  cur.hist.push({s:cur.status,d:new Date().toISOString()});save();render()
}
$("#dOk").onclick=()=>{
  const p=+$("#dPeso").value;if(!(p>0)){$("#dPeso").focus();return}
  $("#dDes").close();advance({peso:p,destino:$("#dDest").value})
};
function addCar(){
  const n=$("#cNome").value.trim();
  if(!n){$("#cErr").textContent="Informe o nome da transportadora.";return}
  if(CARS.some(c=>c.toLowerCase()===n.toLowerCase())){$("#cErr").textContent="Essa transportadora já está cadastrada.";return}
  CARS.push(n);try{localStorage.setItem(CKEY,JSON.stringify(CARS))}catch(e){}
  $("#dCar").close();render()
}
$("#cOk").onclick=addCar;
$("#cNome").addEventListener("keydown",e=>{if(e.key==="Enter")addCar()});
$("#add").onclick=()=>{$("#nCar").innerHTML=opts(CARS);$("#nTipo").innerHTML=opts(TIPOS);$("#nObra").value="";$("#dNew").showModal()};
$("#nOk").onclick=()=>{
  const o=$("#nObra").value.trim();if(!o){$("#nObra").focus();return}
  const n=Math.max(99,...data.map(c=>+c.id.slice(3)))+1;
  data.unshift({id:"CX-"+n,carrier:$("#nCar").value,obra:o,tipo:$("#nTipo").value,status:"Disponível",peso:0,destino:"",hist:[{s:"Disponível",d:new Date().toISOString()}]});
  save();$("#dNew").close();tab="cacambas";render()
};
render();