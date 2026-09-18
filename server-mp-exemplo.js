// PetLivre · Backend Mercado Pago com OAuth multi-loja
// A AGÊNCIA configura 1x. O DONO DA LOJA só clica "Conectar" no pedidos.html.
//
// Env no Render:
// MP_CLIENT_ID, MP_CLIENT_SECRET, MP_REDIRECT_URI=https://SEU-BACKEND/mp/callback
// (Opcional modo antigo loja única: MP_ACCESS_TOKEN)
//
// npm i express cors dotenv
// node server-mp-exemplo.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.MP_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MP_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.MP_REDIRECT_URI || "";
const SINGLE_TOKEN = process.env.MP_ACCESS_TOKEN || "";
const TOKENS_FILE = "./loja-tokens.json";

function lerTokens() {
  try { return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8")); }
  catch { return {}; }
}
function salvarTokens(t) { fs.writeFileSync(TOKENS_FILE, JSON.stringify(t, null, 2)); }
function tokenDaLoja(loja = "petlivre") {
  const todos = lerTokens();
  return todos[loja]?.access_token || SINGLE_TOKEN || "";
}

// 1) URL que o botão "Conectar" abre — dono loga no MP e autoriza
app.get("/mp/connect-url", (req, res) => {
  const loja = req.query.loja || "petlivre";
  if (!CLIENT_ID || !REDIRECT_URI) return res.status(500).json({ erro: "Backend sem MP_CLIENT_ID/REDIRECT_URI" });
  const url = "https://auth.mercadopago.com.br/authorization" +
    `?client_id=${CLIENT_ID}&response_type=code&platform_id=mp` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${encodeURIComponent(loja)}`;
  res.json({ url });
});

// 2) MP redireciona pra cá com ?code=TG-...&state=petlivre — trocamos por access_token
app.get("/mp/callback", async (req, res) => {
  const { code, state } = req.query;
  const loja = state || "petlivre";
  try {
    const r = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    const data = await r.json();
    if (!data.access_token) return res.status(400).send("Falha OAuth: " + JSON.stringify(data).slice(0, 300));
    const todos = lerTokens();
    todos[loja] = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      public_key: data.public_key,
      user_id: data.user_id,
      live_mode: data.live_mode,
      pego_em: new Date().toISOString()
    };
    salvarTokens(todos);
    // Volta pro painel com sucesso (troque pela URL real do site em produção)
    res.send(`<h2>✅ ${loja} conectada!</h2><p>Pode fechar e voltar ao painel.</p><script>setTimeout(()=>window.close(),2500)</script>`);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.get("/mp/status", (req, res) => {
  const loja = req.query.loja || "petlivre";
  const todos = lerTokens();
  const t = todos[loja];
  res.json({ conectado: !!t?.access_token, user_id: t?.user_id || null, live_mode: !!t?.live_mode });
});

app.post("/mp/desconectar", (req, res) => {
  const loja = req.body.loja || "petlivre";
  const todos = lerTokens();
  delete todos[loja];
  salvarTokens(todos);
  res.json({ ok: true });
});

async function mpFetchLoja(loja, path, opt = {}) {
  const token = tokenDaLoja(loja);
  const r = await fetch(`https://api.mercadopago.com${path}`, {
    ...opt,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opt.headers || {}) }
  });
  return r.json();
}

app.post("/criar-pagamento-pix", async (req, res) => {
  try {
    const { pedidoId, total, nome, email, loja } = req.body;
    const data = await mpFetchLoja(loja || "petlivre", "/v1/payments", {
      method: "POST",
      body: JSON.stringify({
        transaction_amount: Number(total),
        description: `PetLivre ${pedidoId}`,
        payment_method_id: "pix",
        external_reference: pedidoId,
        payer: { first_name: nome || "Cliente", email: email || "cliente@petlivre.com.br" }
      })
    });
    res.json({
      id: data.id, status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code || "",
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || ""
    });
  } catch (e) { res.status(500).json({ erro: String(e) }); }
});

app.get("/status-pagamento/:id", async (req, res) => {
  try {
    const loja = req.query.loja || "petlivre";
    const data = await mpFetchLoja(loja, `/v1/payments/${req.params.id}`);
    res.json({ status: data.status, id: data.id });
  } catch (e) { res.status(500).json({ erro: String(e) }); }
});

app.post("/webhook", (req, res) => {
  console.log("MP webhook:", JSON.stringify(req.body).slice(0, 500));
  res.sendStatus(200);
});

app.post("/reembolsar", async (req, res) => {
  try {
    const { paymentId, valor, loja } = req.body;
    const data = await mpFetchLoja(loja || "petlivre", `/v1/payments/${paymentId}/refunds`, {
      method: "POST", body: JSON.stringify(valor ? { amount: Number(valor) } : {})
    });
    res.json(data);
  } catch (e) { res.status(500).json({ erro: String(e) }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("PetLivre MP backend na porta " + PORT));
