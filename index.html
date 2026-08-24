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

    const body =
      req.body || {};

    const {
      titulo,
      email,
      dados
    } = body;


    /*
    ========================================
    VALIDAR DADOS RECEBIDOS
    ========================================
    */

    if (!body.payment_method_id) {

      return res.status(400).json({
        error:
          "Método de pagamento não informado."
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
        179.99

    };


    if (!precos[titulo]) {

      return res.status(400).json({
        error:
          "Produto inválido."
      });

    }


    let valor =
      precos[titulo];


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
    COPIAR DADOS DO BRICK
    ========================================
    */

    const pagamento = {

      ...body,

      titulo:
        undefined,

      email:
        undefined,

      dados:
        undefined,

      transaction_amount:
        Number(valor),

      description:
        String(titulo),

      payer: {

        ...(body.payer || {}),

        email:
          email

      }

    };


    /*
    ========================================
    REMOVER CAMPOS QUE NÃO PERTENCEM
    À API DO MERCADO PAGO
    ========================================
    */

    delete pagamento.titulo;

    delete pagamento.email;

    delete pagamento.dados;


    /*
    ========================================
    VALIDAR CAMPOS IMPORTANTES
    ========================================
    */

    if (
      !pagamento.payer ||
      !pagamento.payer.email
    ) {

      return res.status(400).json({
        error:
          "E-mail do comprador não informado."
      });

    }


    /*
    ========================================
    ID ÚNICO
    ========================================
    */

    const idempotencyKey =
      crypto.randomUUID();


    /*
    ========================================
    ENVIAR AO MERCADO PAGO
    ========================================
    */

    const resposta =
      await fetch(
        "https://api.mercadopago.com/v1/payments",
        {

          method:
            "POST",

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
    ERRO
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
