// ===== PetLivre · Config Mercado Pago =====
// SITE CLIENTES: index, busca, produto, checkout
// SITE LOJISTA: pedidos.html > Configurar Pagamentos
//
// DONO DA LOJA: não entra em site dev. Só abre pedidos.html e clica
// "Conectar com Mercado Pago", loga e autoriza. Pronto.
// AGÊNCIA (você):
// - Netlify: suba essa pasta, em Site settings > Environment ponha
//   MP_CLIENT_ID, MP_CLIENT_SECRET, MP_REDIRECT_URI=https://SEU-SITE.netlify.app/mp/callback
//   e ative Blobs (grátis). BACKEND_URL abaixo = URL do próprio site.
// - Render (alternativa): suba server-mp-exemplo.js e ponha a URL aqui.
const MP_CONFIG = {
  BACKEND_URL: "https://petlivre.netlify.app", // Netlify: "https://petlivre.netlify.app" | Render: "https://xxx.onrender.com" | vazio = demo
  LOJA_ID: "petlivre", // um por cliente: "petlivre-centro", "petshop-x"...
  LOJA_NOME: "PetLivre"
};
