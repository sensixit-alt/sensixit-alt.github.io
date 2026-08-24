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
        error:
          "MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel."
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
        error:
          "Dados do pagamento não recebidos."
      });
    }

    if (!titulo) {
      return res.status(400).json({
        error:
          "Produto não informado."
      });
    }

    if (!email) {
      return res.status(400).json({
        error:
          "E-mail não informado."
      });
    }

    /*
    ========================================
    PREÇOS OFICIAIS
    ========================================
    */

    const precos = {

      "Sensibilidade Profissional Mobile iOS":
        80,

      "Sensibilidade Profissional Mobile Android":
        75,

      "Sensibilidade Profissional Emulador":
        97,

      "Xit VIP Atualizado iOS":
        199.99,

      "Xit VIP Atualizado Android":
        179.99,

      "Xit VIP Atualizado Emulador":
        179.99,

      "65 Diamantes":
        1.50,

      "100 Diamantes":
        3.99,

      "310 Diamantes":
        12.99,

      "520 Diamantes":
        18.99,

      "1.060 Diamantes":
        41.99,

      "2.180 Diamantes":
        85.99,

      "5.600 Diamantes":
        205.99,

      "22.400 Diamantes":
        819.99

    };

    /*
    ========================================
    VERIFICAR PRODUTO
    ========================================
    */

    if (
      !Object.prototype.hasOwnProperty.call(
        precos,
        titulo
      )
    ) {

      return res.status(400).json({
        error:
          "Produto inválido."
      });

    }

    /*
    ========================================
    VALOR OFICIAL
    ========================================
    */

    let valor =
      Number(precos[titulo]);

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
    DADOS DO PAGADOR
    ========================================
    */

    const pagamento = {

      ...formData,

      transaction_amount:
        Number(valor),

      description:
        String(titulo),

      payer: {

        ...(formData.payer || {}),

        email:
          String(email)

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
    ENVIAR AO MERCADO PAGO
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

    /*
    ========================================
    ERRO DO MERCADO PAGO
    ========================================
    */

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
