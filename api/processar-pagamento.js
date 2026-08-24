export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: "MERCADOPAGO_ACCESS_TOKEN não configurado."
      });
    }

    const {
      formData,
      titulo,
      email,
      dados
    } = req.body || {};

    if (!formData) {
      return res.status(400).json({
        error: "Dados do pagamento não recebidos."
      });
    }

    /*
    ========================================
    PREÇOS OFICIAIS DOS PRODUTOS
    ========================================
    */

    const precos = {

      "Sensibilidade Profissional Mobile iOS": 80,

      "Sensibilidade Profissional Mobile Android": 75,

      "Sensibilidade Profissional Emulador": 97,

      "Xit VIP Atualizado iOS": 199.99,

      "Xit VIP Atualizado Android": 179.99,

      "Xit VIP Atualizado Emulador": 179.99

    };

    if (!precos[titulo]) {
      return res.status(400).json({
        error: "Produto inválido."
      });
    }

    let valor = precos[titulo];

    /*
    ========================================
    ADICIONAIS
    ========================================
    */

    if (
      titulo === "Xit VIP Atualizado iOS" &&
      dados?.extraIOS === true
    ) {
      valor += 15;
    }

    if (
      titulo === "Xit VIP Atualizado Android" &&
      dados?.extraAndroid === true
    ) {
      valor += 10;
    }

    /*
    ========================================
    DADOS DO FORMULÁRIO
    ========================================
    */

    const pagamento = {
      ...formData,

      transaction_amount: Number(valor),

      description: String(titulo),

      payer: {
        ...(formData.payer || {}),
        email: email
      }
    };

    /*
    ========================================
    ID ÚNICO DO PAGAMENTO
    ========================================
    */

    const idempotencyKey =
      crypto.randomUUID();

    /*
    ========================================
    ENVIAR PARA MERCADO PAGO
    ========================================
    */

    const resposta = await fetch(
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
          "Mercado Pago recusou o pagamento.",

        details:
          resultado

      });

    }

    /*
    ========================================
    SUCESSO
    ========================================
    */

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
        "Erro interno ao processar pagamento.",

      details:
        erro.message

    });

  }

}
