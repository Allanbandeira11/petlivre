// POST /.netlify/functions/mp-criar-pagamento-pix {pedidoId,total,nome,email,loja}
const { mpFetchLoja, json } = require("./_store");
exports.handler = async (event) => {
  try {
    const { pedidoId, total, nome, email, loja } = JSON.parse(event.body || "{}");
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
    return json(200, { id: data.id, status: data.status, qr_code: data.point_of_interaction?.transaction_data?.qr_code || "", qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64 || "" });
  } catch (e) { return json(500, { erro: String(e) }); }
};
