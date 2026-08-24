export default async function handler(req, res) {

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

    if (!titulo || preco === undefined || preco === null) {
      return res.status(400).json({
        error: "Produto ou preço não informado"
      });
    }

    const valor = Number(preco);

    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({
        error: "Preço inválido"
      });
    }

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error:
          "Access Token do Mercado Pago não configurado no Vercel"
      });
    }

    const resposta = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
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

          payer: email
            ? {
                email: String(email)
              }
            : undefined

        })
      }
    );

    const dados =
      await resposta.json();

    if (!resposta.ok) {

      console.error(
        "Erro Mercado Pago:",
        dados
      );

      return res.status(resposta.status).json({
        error:
          dados.message ||
          dados.error ||
          "Mercado Pago recusou a criação do pagamento"
      });
    }

    if (!dados.init_point) {

      return res.status(500).json({
        error:
          "Mercado Pago não retornou o link de pagamento"
      });
    }

    return res.status(200).json({

      id: dados.id,

      link: dados.init_point

    });

  } catch (erro) {

    console.error(
      "Erro ao criar pagamento:",
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
