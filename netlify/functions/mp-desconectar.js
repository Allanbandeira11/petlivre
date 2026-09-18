// POST /.netlify/functions/mp-desconectar {loja}
const { lerTokens, salvarTokens, json } = require("./_store");
exports.handler = async (event) => {
  const { loja } = JSON.parse(event.body || "{}");
  const todos = await lerTokens();
  delete todos[loja || "petlivre"];
  await salvarTokens(todos);
  return json(200, { ok: true });
};
