// GET /.netlify/functions/mp-callback?code=TG-...&state=petlivre (redirect_uri do app MP)
const { lerTokens, salvarTokens } = require("./_store");
exports.handler = async (event) => {
  const code = event.queryStringParameters?.code || "";
  const loja = event.queryStringParameters?.state || "petlivre";
  try {
    const r = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.MP_CLIENT_ID,
        client_secret: process.env.MP_CLIENT_SECRET,
        grant_type: "authorization_code",
        code, redirect_uri: process.env.MP_REDIRECT_URI
      })
    });
    const data = await r.json();
    if (!data.access_token) return { statusCode: 400, body: "Falha OAuth: " + JSON.stringify(data).slice(0, 300) };
    const todos = await lerTokens();
    todos[loja] = { access_token: data.access_token, refresh_token: data.refresh_token, public_key: data.public_key, user_id: data.user_id, live_mode: data.live_mode, pego_em: new Date().toISOString() };
    await salvarTokens(todos);
    return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: `<h2>✅ ${loja} conectada!</h2><p>Pode fechar e voltar ao painel.</p><script>setTimeout(()=>window.close(),2500)</script>` };
  } catch (e) { return { statusCode: 500, body: String(e) }; }
};
