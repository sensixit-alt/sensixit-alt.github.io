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

    // ========================================
    // DADOS DO SITE
    // ========================================

    const {
      titulo,
      preco,
      email
    } = req.body || {};


    // ========================================
    // VALIDAÇÃO DO PRODUTO
    // ========================================

    if (!titulo) {

      return res.status(400).json({
        error: "Produto não informado"
      });

    }


    // ========================================
    // VALIDAÇÃO DO PREÇO
    // ========================================

    const valor = Number(preco);

    if (
      !Number.isFinite(valor) ||
      valor <= 0
    ) {

      return res.status(400).json({
        error: "Preço inválido"
      });

    }


    // ========================================
    // ACCESS TOKEN
    // ========================================

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;


    if (!accessToken) {

      return res.status(500).json({
        error:
          "MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel"
      });

    }


    // ========================================
    // URL DO SEU SITE
    // ========================================

    const host =
      req.headers.host;

    if (!host) {

      return res.status(500).json({
        error:
          "Não foi possível identificar o domínio do site"
      });

    }

    const siteUrl =
      `https://${host}`;


    // ========================================
    // CRIAR PREFERÊNCIA
    // ========================================

    const preferencia = {

      items: [

        {

          title:
            String(titulo),

          quantity:
            1,

          currency_id:
            "BRL",

          unit_price:
            valor

        }

      ],


      // ======================================
      // RETORNO PARA O SENXIT
      // ======================================

      back_urls: {

        success:
          `${siteUrl}/?pagamento=sucesso`,

        pending:
          `${siteUrl}/?pagamento=pendente`,

        failure:
          `${siteUrl}/?pagamento=falhou`

      },


      // Volta automaticamente para o site
      // depois de pagamento aprovado

      auto_return:
        "approved",


      // Identificador interno da compra

      external_reference:
        `SENXIT-${Date.now()}`

    };


    // ========================================
    // CRIAR PREFERÊNCIA NO MERCADO PAGO
    // ========================================

    const resposta =
      await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${accessToken}`

          },

          body:
            JSON.stringify(preferencia)

        }
      );


    // ========================================
    // LER RESPOSTA
    // ========================================

    const dados =
      await resposta.json();


    // ========================================
    // ERRO DO MERCADO PAGO
    // ========================================

    if (!resposta.ok) {

      console.error(
        "ERRO MERCADO PAGO:",
        dados
      );

      return res.status(
        resposta.status
      ).json({

        error:
          dados.message ||
          dados.error ||
          "Erro ao criar pagamento",

        details:
          dados

      });

    }


    // ========================================
    // VERIFICAR LINK
    // ========================================

    if (!dados.init_point) {

      console.error(
        "Mercado Pago não retornou init_point:",
        dados
      );

      return res.status(500).json({

        error:
          "Mercado Pago não retornou o link de pagamento",

        details:
          dados

      });

    }


    // ========================================
    // SUCESSO
    // ========================================

    console.log(
      "Pagamento criado:",
      dados.id
    );


    return res.status(200).json({

      id:
        dados.id,

      link:
        dados.init_point

    });


  } catch (erro) {

    // ========================================
    // ERRO GERAL
    // ========================================

    console.error(
      "ERRO NA API:",
      erro
    );


    return res.status(500).json({

      error:
        "Erro interno ao criar pagamento",

      details:
        erro.message

    });

  }

}
