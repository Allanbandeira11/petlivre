const WHATS = "5521999999999"; // TROCAR pelo WhatsApp da loja
const CATS = ["Todos","Rações","Saúde","Brinquedos","Higiene","Acessórios","Camas"];
const PRODUCTS = [
  {id:1, cat:"Rações", name:"Ração Premium Cães Adultos 10kg", price:189.9, old:239.9, rating:"4.9 · 2.3k", ship:"Frete grátis", c1:"#D72600", c2:"#ff7a45"},
  {id:2, cat:"Rações", name:"Ração Gatos Castrados 7,5kg", price:164.9, old:199.9, rating:"4.8 · 1.1k", ship:"Frete grátis", c1:"#221607", c2:"#a97b2f"},
  {id:3, cat:"Rações", name:"Ração Filhotes Frango e Arroz 3kg", price:89.9, old:109.9, rating:"4.9 · 800", ship:"", c1:"#EE9D00", c2:"#D72600"},
  {id:4, cat:"Saúde", name:"Vermífugo Cães e Gatos 2 comprimidos", price:34.9, old:44.9, rating:"4.7 · 3k", ship:"", c1:"#00753a", c2:"#00b85c", tag:"Sem receita"},
  {id:5, cat:"Saúde", name:"Antipulgas e Carrapatos 3 pipetas", price:119.9, old:149.9, rating:"4.8 · 1.9k", ship:"Frete grátis", c1:"#0A5587", c2:"#00A6FB", tag:"Sem receita"},
  {id:6, cat:"Saúde", name:"Vacina Importada V10 (aplicação parceira)", price:129.9, old:159.9, rating:"4.9 · 500", ship:"Retirada local", c1:"#6d28d9", c2:"#c084fc", tag:"Sem receita"},
  {id:7, cat:"Saúde", name:"Vitamina Pelo e Pele 60 caps", price:49.9, old:69.9, rating:"4.6 · 700", ship:"", c1:"#b45309", c2:"#fbbf24"},
  {id:8, cat:"Brinquedos", name:"Bolinha Resistente + Corda", price:29.9, old:39.9, rating:"4.7 · 900", ship:"", c1:"#D72600", c2:"#FFD100"},
  {id:9, cat:"Brinquedos", name:"Arranhador Gato Torre 60cm", price:199.9, old:259.9, rating:"4.8 · 400", ship:"Frete grátis", c1:"#57534e", c2:"#d6d3d1"},
  {id:10, cat:"Higiene", name:"Shampoo Neutro 500ml", price:39.9, old:54.9, rating:"4.8 · 1.2k", ship:"", c1:"#0284c7", c2:"#7dd3fc"},
  {id:11, cat:"Higiene", name:"Tapete Higiênico 30un", price:74.9, old:94.9, rating:"4.7 · 2k", ship:"", c1:"#0f766e", c2:"#5eead4"},
  {id:12, cat:"Acessórios", name:"Coleira + Guia Ajustável", price:59.9, old:79.9, rating:"4.8 · 600", ship:"", c1:"#991b1b", c2:"#f87171"},
  {id:13, cat:"Acessórios", name:"Comedouro Alumínio Antiformiga", price:44.9, old:59.9, rating:"4.9 · 1.5k", ship:"", c1:"#334155", c2:"#94a3b8"},
  {id:14, cat:"Camas", name:"Cama Nuvem Antiestresse M", price:139.9, old:189.9, rating:"4.9 · 800", ship:"Frete grátis", c1:"#7c2d12", c2:"#fb923c"},
  {id:15, cat:"Camas", name:"Casinha Plástica Desmontável", price:229.9, old:299.9, rating:"4.7 · 300", ship:"Frete grátis", c1:"#1e3a8a", c2:"#60a5fa"},
  {id:16, cat:"Rações", name:"Petisco Biscoito Sortido 1kg", price:24.9, old:32.9, rating:"4.6 · 500", ship:"", c1:"#a16207", c2:"#fde047"},
];
let cart = JSON.parse(localStorage.getItem("petlivre_cart") || "[]");
let activeCat = "Todos";

function cats(){
  document.getElementById("cats").innerHTML = CATS.map(c =>
    `<button class="${c===activeCat?'active':''}" onclick="setCat('${c}')">${c}</button>`).join("");
}
function setCat(c){ activeCat=c; cats(); render(); }
function filtroRapido(c, e){ if(e) e.preventDefault(); setCat(c); document.getElementById("catalogo").scrollIntoView({behavior:"smooth"}); }
function voltarInicio(e){ if(e) e.preventDefault(); setCat("Todos"); document.getElementById("busca").value=""; render(); window.scrollTo({top:0,behavior:"smooth"}); }

function fmt(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

function render(){
  const qRaw = document.getElementById("busca") ? document.getElementById("busca").value : "";
  const tokens = norm(qRaw).split(/[^a-z0-9]+/).filter(Boolean);
  const ordem = document.getElementById("ordem").value;
  let list = PRODUCTS.filter(p => {
    if(activeCat!=="Todos" && p.cat!==activeCat) return false;
    if(!tokens.length) return true;
    const w = palavrasBusca(p);
    return tokens.every(tok => tokenOk(tok, w));
  });
  if(ordem==="menor") list.sort((a,b)=>a.price-b.price);
  if(ordem==="maior") list.sort((a,b)=>b.price-a.price);
  if(ordem==="off") list.sort((a,b)=>((b.old-b.price)/b.old)-((a.old-a.price)/a.old));
  document.getElementById("tituloLista").textContent = activeCat==="Todos" ? "Todos os produtos" : activeCat;
  document.getElementById("grid").innerHTML = list.map(p=>{
    const off = Math.round((1-p.price/p.old)*100);
    return `<div class="card">
      <a class="p-link" href="produto.html?id=${p.id}"><div class="p-img" style="background:linear-gradient(135deg,${p.c1},${p.c2})">${p.name[0]}</div></a>
      <span class="p-cat">${p.cat}${p.tag?" · "+p.tag:""}</span>
      <a class="p-name" href="produto.html?id=${p.id}"><h3>${p.name}</h3></a>
      <span class="stars">★ ${p.rating}</span>
      <div class="price"><small>${fmt(p.old)}</small><b>${fmt(p.price)}</b><em>-${off}%</em></div>
      <span class="ship">${p.ship}</span>
      <div class="row2"><a class="btn btn-ghost" href="produto.html?id=${p.id}">Ver</a><button class="btn btn-dark" onclick="add(${p.id})">Adicionar</button></div>
    </div>`;
  }).join("") || "<p class='muted'>Nada encontrado. Tente outra busca.</p>";
}

function save(){ localStorage.setItem("petlivre_cart", JSON.stringify(cart)); }
function add(id){
  const f = cart.find(i=>i.id===id);
  if(f) f.q++; else cart.push({id, q:1});
  save(); renderCart(); toast("Adicionado ao carrinho!");
}
function ver(id){
  window.location.href = "produto.html?id=" + id;
}

function renderCart(){
  const box = document.getElementById("cartItems");
  if(!box) return;
  const cupomEl = document.getElementById("cupom");
  const cupom = (cupomEl ? cupomEl.value : localStorage.getItem("petlivre_cupom") || "").trim().toUpperCase();
  if(cupomEl && cupom) cupomEl.value = cupom;
  localStorage.setItem("petlivre_cupom", cupom);
  let sub = 0;
  box.innerHTML = cart.map(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id); if(!p) return ""; sub += p.price*i.q;
    return `<div class="c-item"><div><b>${p.name}</b><small>${fmt(p.price)} cada</small><div class="qty"><button onclick="ch(${p.id},-1)">-</button><b>${i.q}</b><button onclick="ch(${p.id},1)">+</button></div></div><button class="h-btn" onclick="rm(${p.id})">X</button></div>`;
  }).join("") || "<p class='muted'>Carrinho vazio. Bora encher de coisa boa pro pet?</p>";
  const desc = cupom==="PET10" ? sub*0.10 : 0;
  const base = sub - desc;
  const falta = Math.max(0, 99 - base);
  const barra = document.getElementById("freteBar");
  if(barra){
    barra.innerHTML = base >= 99
      ? `<div class="frete-ok">🎉 Você ganhou FRETE GRÁTIS!</div><div class="frete-track"><i style="width:100%"></i></div>`
      : `<div class="frete-falta">Faltam <b>${fmt(falta)}</b> para o frete grátis</div><div class="frete-track"><i style="width:${Math.min(100, base/99*100)}%"></i></div>`;
  }
  const st = document.getElementById("subTotal"); if(st) st.textContent = fmt(sub);
  const dc = document.getElementById("desconto"); if(dc) dc.textContent = "-"+fmt(desc);
  const tt = document.getElementById("total"); if(tt) tt.textContent = fmt(base);
  const cc = document.getElementById("cartCount"); if(cc) cc.textContent = cart.reduce((s,i)=>s+i.q,0);
}
function ch(id,d){ const i=cart.find(x=>x.id===id); if(!i) return; i.q+=d; if(i.q<=0) cart=cart.filter(x=>x.id!==id); save(); renderCart(); if(typeof renderResumo==="function") renderResumo(); }
function rm(id){ cart=cart.filter(x=>x.id!==id); save(); renderCart(); if(typeof renderResumo==="function") renderResumo(); }
function abrirCarrinho(){ renderCart(); document.getElementById("drawer").hidden=false; }
function fecharCarrinho(){ document.getElementById("drawer").hidden=true; }

function irCheckout(e){
  if(e) e.preventDefault();
  if(!cart.length){ toast("Carrinho vazio"); return; }
  const cupomEl = document.getElementById("cupom");
  if(cupomEl) localStorage.setItem("petlivre_cupom", cupomEl.value.trim().toUpperCase());
  window.location.href = "checkout.html";
}

// ===== PEDIDOS (checkout funcional + painel lojista, demo em localStorage) =====
function getOrders(){ try{ return JSON.parse(localStorage.getItem("petlivre_orders")||"[]"); }catch{ return []; } }
function saveOrders(list){ localStorage.setItem("petlivre_orders", JSON.stringify(list)); }
function calcPedido(cupom, pagamento, entrega){
  const sub = cart.reduce((s,i)=>{ const p=PRODUCTS.find(x=>x.id===i.id); return s + (p?p.price*i.q:0); },0);
  const desc = (cupom==="PET10" && pagamento==="Pix") ? sub*0.10 : 0;
  const base = sub - desc;
  const frete = entrega==="Retirada" ? 0 : (base>=99||base===0 ? 0 : 9.90);
  return {sub, desc, frete, total: base+frete};
}
function criarPedido(dados){
  const orders = getOrders();
  const num = "PL-" + String(Date.now()).slice(-6);
  const pedido = {id: num, data: new Date().toISOString(), status: "Novo", ...dados};
  orders.unshift(pedido);
  saveOrders(orders);
  cart = []; save();
  localStorage.removeItem("petlivre_cupom");
  renderCart();
  return pedido;
}
function setStatusPedido(id, status){
  const orders = getOrders();
  const o = orders.find(x=>x.id===id);
  if(o){ o.status = status; saveOrders(orders); }
}
function delPedido(id){ saveOrders(getOrders().filter(x=>x.id!==id)); }
function msgPedidoWhats(p){
  const linhas = p.items.map(i=>`- ${i.name} x${i.q} = ${fmt(i.price*i.q)}`).join("\n");
  const txt = `NOVO PEDIDO ${p.id} — PetLivre\n\n${linhas}\n\nSubtotal: ${fmt(p.sub)}\nDesconto: ${fmt(p.desc)}\nFrete (${p.entrega}): ${fmt(p.frete)}\nTotal: ${fmt(p.total)}\n\nCliente: ${p.cliente.nome}\nZap: ${p.cliente.zap}\nPagamento: ${p.pagamento}${p.troco?` (troco p/ ${p.troco})`:""}\nEntrega: ${p.entrega}${p.endereco?`\nEnd: ${p.endereco.rua}, ${p.endereco.numero} - ${p.endereco.bairro}, ${p.endereco.cidade}`:""}\nObs: ${p.obs||"-"}`;
  return `https://wa.me/${WHATS}?text=${encodeURIComponent(txt)}`;
}
function checkoutWhats(e){
  if(e) e.preventDefault();
  window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent("Olá! Vim pelo site PetLivre e quero ajuda 🐾")}`,"_blank");
}

const INFO = {
  ofertas:{t:"Ofertas da semana", b:"<p>Rações com até 30% OFF + 10% no Pix com PET10. Frete grátis acima de R$ 99.</p>"},
  trocas:{t:"Trocas e devoluções", b:"<p>7 dias para trocar, produto lacrado. Ração aberta só troca por defeito. Chama no WhatsApp que resolvemos.</p>"},
  frete:{t:"Frete e prazos", b:"<p>Entrega local no mesmo dia (pedidos até 16h). Retirada grátis. Enviamos para todo Brasil via correios.</p>"},
  pag:{t:"Pagamento", b:"<p>Pix com 10% OFF (PET10), cartão em até 6x, dinheiro na entrega.</p>"}
};
function abrirModal(k, html){
  if(INFO[k]){ document.getElementById("mTitle").textContent=INFO[k].t; document.getElementById("mBody").innerHTML=INFO[k].b; }
  else { document.getElementById("mTitle").textContent=k; document.getElementById("mBody").innerHTML=html; }
  document.getElementById("modal").hidden=false;
}
function fecharModal(){ document.getElementById("modal").hidden=true; }
function toast(m){ const t=document.getElementById("toast"); if(!t) return; t.textContent=m; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

// ===== BUSCA COM AUTOCOMPLETE + PAGINA DE RESULTADOS =====
function norm(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}
// Grupos de sinônimos (já sem acento, minúsculo)
const SINONIMOS = [
  ["cao","caes","cachorro","cachorrinha","dog"],
  ["gato","gata","cat","gatinho"],
  ["racao","alimento","comida"],
  ["antipulgas","pulga","carrapato","pipeta"],
  ["vermifugo","verme","vermifugos"],
  ["vacina","vacinas","v10"],
  ["brinquedo","brinquedos","bolinha","arranhador","jogo"],
  ["cama","caminha","casinha","nuvem"],
  ["coleira","guia"],
  ["comedouro","bebedouro","pote"],
  ["shampoo","banho","higiene"],
  ["tapete","fralda","higienico"],
  ["vitamina","pelo","pele","suplemento"],
  ["petisco","biscoito","ossinho"]
];
function tokenOk(tok, words){
  if(!tok) return true;
  // 1) direto por palavra: exata, prefixo, ou contém com prefixo comum >=4 (evita "cao" dentro de "racao")
  for(const w of words){
    if(w===tok) return true;
    if(w.startsWith(tok) || tok.startsWith(w)) return true;
    if(tok.length>=4 && w.length>=4 && (w.includes(tok) || tok.includes(w))){
      let common=0;
      while(common<Math.min(w.length,tok.length) && w[common]===tok[common]) common++;
      if(common>=4) return true;
    }
  }
  // 2) sinônimos só por palavra exata/prefixo (nunca substring solta)
  for(const g of SINONIMOS){
    if(g.includes(tok)){
      for(const s of g){
        if(s===tok) continue;
        for(const w of words){
          if(w===s || w.startsWith(s) || s.startsWith(w)) return true;
        }
      }
    }
  }
  return false;
}
function textoBusca(p){
  // Não foca só no título: junta nome + categoria + tag + info de envio + avaliação
  return norm([p.name, p.cat, p.tag, p.ship, p.rating].filter(Boolean).join(" "));
}
function palavrasBusca(p){
  return textoBusca(p).split(/[^a-z0-9]+/).filter(Boolean);
}
function filtrarProdutos(q){
  const tokens = norm(q).split(/[^a-z0-9]+/).filter(Boolean);
  if(!tokens.length) return [];
  const comTexto = PRODUCTS.map(p => ({p, w: palavrasBusca(p)}));
  // 1) Tenta AND: tem que ter TODAS as palavras (ex: "racao caes" acha "Ração Premium Cães...")
  const andList = comTexto.filter(x => tokens.every(t => tokenOk(t, x.w)));
  if(andList.length) return andList.map(x => x.p);
  // 2) Fallback OR: se não achou tudo junto, mostra quem tem PELO MENOS 1 palavra, ordenado por relevância
  return comTexto
    .map(x => ({...x, hits: tokens.filter(t => tokenOk(t, x.w)).length}))
    .filter(x => x.hits > 0)
    .sort((a,b) => b.hits - a.hits)
    .map(x => x.p);
}

function mostrarSugestoes(inputId, boxId){
  const input = document.getElementById(inputId);
  const box = document.getElementById(boxId);
  if(!input || !box) return;
  const q = input.value.trim();
  const list = filtrarProdutos(q).slice(0, 6);
  if(!q || !list.length){ box.hidden = true; box.innerHTML = ""; return; }
  box.innerHTML = list.map(p => `
    <div class="sug-item" onclick="escolherSugestao(${p.id})">
      <span class="sug-thumb" style="background:linear-gradient(135deg,${p.c1},${p.c2})">${p.name[0]}</span>
      <span class="sug-txt"><b>${p.name}</b><small>${p.cat} · ${fmt(p.price)}</small></span>
    </div>`).join("") +
    `<div class="sug-all" onclick="irBusca('${inputId}')">Ver todos os resultados para "<b>${q.replace(/</g,"&lt;")}</b>"</div>`;
  box.hidden = false;
}

function escolherSugestao(id){
  window.location.href = "produto.html?id=" + id;
}

function irBusca(inputId){
  const input = document.getElementById(inputId || "busca") || document.getElementById("busca") || document.getElementById("buscaP");
  const v = (input ? input.value : "").trim();
  window.location.href = "busca.html?q=" + encodeURIComponent(v);
}

function configurarBusca(inputId, boxId){
  const input = document.getElementById(inputId);
  if(!input) return;
  input.setAttribute("autocomplete","off");
  input.addEventListener("input", () => mostrarSugestoes(inputId, boxId));
  input.addEventListener("focus", () => { if(input.value.trim()) mostrarSugestoes(inputId, boxId); });
  input.addEventListener("keydown", (e) => { if(e.key === "Enter"){ e.preventDefault(); irBusca(inputId); } });
}

// Fecha sugestoes ao clicar fora
document.addEventListener("click", (e) => {
  document.querySelectorAll(".sugestoes").forEach(box => {
    const wrap = box.closest(".search");
    if(wrap && !wrap.contains(e.target)) box.hidden = true;
  });
});

if (document.getElementById("cats")) cats();
configurarBusca("busca", "sugestoes");
configurarBusca("buscaP", "sugP");
configurarBusca("buscaB", "sugB");
if (document.getElementById("grid")) render();
if (document.getElementById("cartItems")) renderCart();
const _modal = document.getElementById("modal");
if (_modal) _modal.addEventListener("click",e=>{ if(e.target.id==="modal") fecharModal(); });
