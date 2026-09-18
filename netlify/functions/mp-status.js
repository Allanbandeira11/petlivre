// GET /.netlify/functions/mp-status?loja=petlivre
const { lerTokens, json } = require("./_store");
exports.handler = async (event) => {
  const loja = event.queryStringParameters?.loja || "petlivre";
  const todos = await lerTokens();
  const t = todos[loja];
  const envFallback = !!process.env.MP_ACCESS_TOKEN;
  return json(200, { conectado: !!(t?.access_token || envFallback), user_id: t?.user_id || null, live_mode: !!t?.live_mode, modo: t?.access_token ? "oauth" : (envFallback ? "token-fixo" : "demo") });
};
