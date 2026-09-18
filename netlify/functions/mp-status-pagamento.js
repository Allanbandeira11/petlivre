// GET /.netlify/functions/mp-status-pagamento?id=123&loja=petlivre
const { mpFetchLoja, json } = require("./_store");
exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters?.id || event.path.split("/").pop();
    const loja = event.queryStringParameters?.loja || "petlivre";
    const data = await mpFetchLoja(loja, `/v1/payments/${id}`);
    return json(200, { status: data.status, id: data.id });
  } catch (e) { return json(500, { erro: String(e) }); }
};
