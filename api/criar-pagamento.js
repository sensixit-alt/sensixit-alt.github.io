export default async function handler(req, res) {

  // ================================
  // CORS
  // ================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // ================================
  // OPTIONS
  // ================================

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ================================
  // SOMENTE POST
  // ================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {

    const {
      titulo,
      preco,
      email
    } = req.body || {};

    // ================================
    // VALIDAÇÃO
    // ================================

    if (!titulo) {
      return res.status(400).json({
        error: "Produto não informado"
      });
    }

    const valor = Number(preco);

    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      return res.status(400).json({
        error: "Preço inválido"
      });
    }

    // ================================
    // ACCESS TOKEN
    // ================================

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error:
          "Access Token do Mercado Pago não configurado"
      });
    }

    // ================================
    // CRIAR PAGAMENTO
    // ================================

    const resposta = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${accessToken}`
        },

        body: JSON.stringify({

          items: [
            {
              title: String(titulo),

              quantity: 1,

              currency_id: "BRL",

              unit_price: valor
            }
          ],

          ...(email
            ? {
                payer: {
                  email: String(email)
                }
              }
            : {})

        })
      }
    );

    // ================================
    // RESPOSTA
    // ================================

    const dados =
      await resposta.json();

    // ================================
    // ERRO MERCADO PAGO
    // ================================

    if (!resposta.ok) {

      console.error(
        "Erro Mercado Pago:",
        dados
      );

      return res.status(
        resposta.status
      ).json({

        error:
          dados.message ||
          dados.error ||
          "Erro ao criar pagamento",

        details: dados

      });
    }

    // ================================
    // VERIFICAR LINK
    // ================================

    if (!dados.init_point) {

      return res.status(500).json({

        error:
          "Mercado Pago não retornou o link de pagamento"

      });
    }

    // ================================
    // SUCESSO
    // ================================

    return res.status(200).json({

      id: dados.id,

      link: dados.init_point

    });

  } catch (erro) {

    console.error(
      "Erro na API:",
      erro
    );

    return res.status(500).json({

      error:
        "Erro ao criar pagamento",

      details:
        erro.message

    });

  }
}
