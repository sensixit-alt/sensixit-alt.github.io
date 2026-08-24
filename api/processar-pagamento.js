export default async function handler(req, res) {

  // ==========================================
  // CORS
  // ==========================================

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


  // ==========================================
  // OPTIONS
  // ==========================================

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }


  // ==========================================
  // SOMENTE POST
  // ==========================================

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Método não permitido"
    });

  }


  try {

    const body = req.body || {};


    // ==========================================
    // ACCESS TOKEN
    // ==========================================

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;


    if (!accessToken) {

      return res.status(500).json({
        error:
          "MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel"
      });

    }


    // ==========================================
    // DADOS DO PAYMENT BRICK
    // ==========================================

    const {

      token,

      transaction_amount,

      amount,

      installments,

      payment_method_id,

      issuer_id,

      payer,

      email,

      titulo,

      description

    } = body;


    // ==========================================
    // VALOR
    // ==========================================

    const valor = Number(
      transaction_amount ?? amount
    );


    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {

      return res.status(400).json({
        error: "Valor do pagamento inválido"
      });

    }


    // ==========================================
    // MÉTODO DE PAGAMENTO
    // ==========================================

    if (!payment_method_id) {

      return res.status(400).json({
        error:
          "Método de pagamento não informado"
      });

    }


    // ==========================================
    // E-MAIL
    // ==========================================

    const emailFinal =
      payer?.email ||
      email;


    if (
      !emailFinal ||
      !String(emailFinal).includes("@")
    ) {

      return res.status(400).json({
        error:
          "E-mail do comprador não informado ou inválido"
      });

    }


    // ==========================================
    // DADOS DO PAGAMENTO
    // ==========================================

    const pagamento = {

      transaction_amount:
        valor,

      description:
        String(
          titulo ||
          description ||
          "Compra SenXit"
        ),

      payment_method_id:
        String(payment_method_id),

      payer: {

        email:
          String(emailFinal)

      }

    };


    // ==========================================
    // PIX / BOLETO
    //
    // IMPORTANTE:
    // PIX NÃO USA TOKEN
    // ==========================================

    if (
      payment_method_id === "pix" ||
      payment_method_id === "bolbradesco"
    ) {

      // Não adicionamos token.

    }


    // ==========================================
    // CARTÃO
    //
    // CARTÃO PRECISA DE TOKEN
    // ==========================================

    else {

      if (!token) {

        return res.status(400).json({

          error:
            "Token do cartão não informado"

        });

      }


      pagamento.token =
        token;


      if (installments) {

        pagamento.installments =
          Number(installments);

      }


      if (issuer_id) {

        pagamento.issuer_id =
          Number(issuer_id);

      }

    }


    // ==========================================
    // ID DE IDEMPOTÊNCIA
    // ==========================================

    const idempotencyKey =
      crypto.randomUUID();


    // ==========================================
    // ENVIAR PARA MERCADO PAGO
    // ==========================================

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


    // ==========================================
    // RESPOSTA
    // ==========================================

    const dados =
      await resposta.json();


    console.log(
      "Resposta Mercado Pago:",
      dados
    );


    // ==========================================
    // ERRO
    // ==========================================

    if (!resposta.ok) {

      return res.status(
        resposta.status
      ).json({

        error:
          dados.message ||
          dados.error ||
          "Erro ao processar pagamento",

        details:
          dados

      });

    }


    // ==========================================
    // SUCESSO
    // ==========================================

    return res.status(200).json({

      id:
        dados.id,

      status:
        dados.status,

      status_detail:
        dados.status_detail,

      payment_method_id:
        dados.payment_method_id,

      transaction_amount:
        dados.transaction_amount,

      point_of_interaction:
        dados.point_of_interaction || null,

      transaction_details:
        dados.transaction_details || null

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
