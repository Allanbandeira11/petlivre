// POST /.netlify/functions/mp-webhook (configure no painel MP)
exports.handler = async (event) => {
  console.log("MP webhook:", (event.body || "").slice(0, 500));
  return { statusCode: 200, body: "ok" };
};
