// GET /.netlify/functions/mp-connect-url?loja=petlivre -> {url}
const { json } = require("./_store");
exports.handler = async (event) => {
  const loja = event.queryStringParameters?.loja || "petlivre";
  const cid = process.env.MP_CLIENT_ID || "";
  const redir = process.env.MP_REDIRECT_URI || "";
  if (!cid || !redir) return json(500, { erro: "Backend sem MP_CLIENT_ID/MP_REDIRECT_URI" });
  const url = "https://auth.mercadopago.com.br/authorization" +
    `?client_id=${cid}&response_type=code&platform_id=mp` +
    `&redirect_uri=${encodeURIComponent(redir)}&state=${encodeURIComponent(loja)}`;
  return json(200, { url });
};
