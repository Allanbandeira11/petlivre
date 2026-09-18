// POST /.netlify/functions/mp-reembolsar {paymentId,valor,loja}
const { mpFetchLoja, json } = require("./_store");
exports.handler = async (event) => {
  try {
    const { paymentId, valor, loja } = JSON.parse(event.body || "{}");
    const data = await mpFetchLoja(loja || "petlivre", `/v1/payments/${paymentId}/refunds`, {
      method: "POST", body: JSON.stringify(valor ? { amount: Number(valor) } : {})
    });
    return json(200, data);
  } catch (e) { return json(500, { erro: String(e) }); }
};
