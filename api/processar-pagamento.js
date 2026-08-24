export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {

    const {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount,
      installments,
      payer,
      titulo,
      email,
      dados
    } = req.body || {};

    if (!token) {
      return res.status(400).json({
        error: "Token do pagamento não informado"
      });
    }

    if (!payment_method_id) {
      return res.status(400).json({
        error: "Método de pagamento não informado"
      });
    }

    const valor = Number(transaction_amount);

    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({
        error: "Valor do pagamento inválido"
      });
    }

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error:
          "MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel"
      });
    }

    const idempotencyKey =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;

    const pagamento = {

      token: token,

      transaction_amount: valor,

      description:
        String(titulo || "Compra SenXit"),

      installments:
        Number(installments || 1),

      payment_method_id:
        payment_method_id,

      payer: {

        email:
          String(
            payer?.email ||
            email ||
            ""
          )

      }

    };

    if (issuer_id) {
      pagamento.issuer_id = issuer_id;
    }

    const resposta =
      await fetch(
        "https://api.mercadopago.com/v1/payments",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${accessToken}`,

            "X-Idempotency-Key":
              idempotencyKey

          },

          body:
            JSON.stringify(pagamento)

        }
      );

    const resultado =
      await resposta.json();

    console.log(
      "Resposta Mercado Pago:",
      resultado
    );

    if (!resposta.ok) {

      return res.status(
        resposta.status
      ).json({

        error:
          resultado.message ||
          resultado.error ||
          "Erro ao processar pagamento",

        details:
          resultado

      });

    }

    return res.status(200).json({

      id:
        resultado.id,

      status:
        resultado.status,

      status_detail:
        resultado.status_detail,

      payment_method_id:
        resultado.payment_method_id

    });

  } catch (erro) {

    console.error(
      "ERRO PROCESSAR PAGAMENTO:",
      erro
    );

    return res.status(500).json({

      error:
        "Erro interno ao processar pagamento",

      details:
        erro.message

    });

  }

}
