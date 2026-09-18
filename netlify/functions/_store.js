// Helper compartilhado (ignorado pelo Netlify por começar com _)
const { getStore } = require("@netlify/blobs");

function store() { return getStore("mp-tokens"); }
async function lerTokens() {
  try { return (await store().get("tokens", { type: "json" })) || {}; }
  catch { return {}; }
}
async function salvarTokens(t) { await store().setJSON("tokens", t); }
async function tokenDaLoja(loja = "petlivre") {
  const todos = await lerTokens();
  return todos[loja]?.access_token || process.env.MP_ACCESS_TOKEN || "";
}
async function mpFetchLoja(loja, path, opt = {}) {
  const token = await tokenDaLoja(loja);
  const r = await fetch(`https://api.mercadopago.com${path}`, {
    ...opt,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opt.headers || {}) }
  });
  return r.json();
}
const json = (statusCode, body) => ({
  statusCode, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify(body)
});
module.exports = { lerTokens, salvarTokens, tokenDaLoja, mpFetchLoja, json };
