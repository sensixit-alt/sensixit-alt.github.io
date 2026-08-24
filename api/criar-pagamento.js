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
    } = req.body;

    if (!titulo || !preco) {
      return res.status(400).json({
        error: "Produto ou preço não informado"
      });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: "Access Token do Mercado Pago não configurado"
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
              title: titulo,
              quantity: 1,
              currency_id: "BRL",
              unit_price: Number(preco)
            }
          ],
          payer: email ? {
            email: email
          } : undefined
        })
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json(dados);
    }

    return res.status(200).json({
      id: dados.id,
      link: dados.init_point
    });

  } catch (erro) {
    return res.status(500).json({
      error: "Erro ao criar pagamento",
      details: erro.message
    });
  }
}
