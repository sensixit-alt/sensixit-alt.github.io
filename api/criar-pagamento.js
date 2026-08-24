export default async function handler(req, res) {

  /*
   * ==========================================
   * CORS
   * ==========================================
   */

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


  /*
   * ==========================================
   * REQUISIÇÃO OPTIONS
   * ==========================================
   *
   * O navegador pode enviar OPTIONS
   * antes do POST.
   *
   * Sem isso pode aparecer:
   * OPTIONS 405
   */

  if (req.method === "OPTIONS") {

    return res.status(204).end();

  }


  /*
   * ==========================================
   * SOMENTE POST
   * ==========================================
   */

  if (req.method !== "POST") {

    return res.status(405).json({

      error:
        "Método não permitido"

    });

  }


  try {

    /*
     * ========================================
     * DADOS RECEBIDOS DO SITE
     * ========================================
     */

    const {
      titulo,
      preco,
      email
    } = req.body || {};


    /*
     * ========================================
     * VALIDAÇÃO
     * ========================================
     */

    if (!titulo) {

      return res.status(400).json({

        error:
          "Produto não informado"

      });

    }


    if (
      preco === undefined ||
      preco === null ||
      Number(preco) <= 0
    ) {

      return res.status(400).json({

        error:
          "Preço inválido"

      });

    }


    /*
     * ========================================
     * ACCESS TOKEN
     * ========================================
     */

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;


    if (!accessToken) {

      return res.status(500).json({

        error:
          "Access Token do Mercado Pago não configurado"

      });

    }


    /*
     * ========================================
     * CRIAR PREFERÊNCIA
     * ========================================
     */

    const resposta = await fetch(

      "https://api.mercadopago.com/checkout/preferences",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${accessToken}`

        },

        body: JSON.stringify({

          items: [

            {

              title:
                String(titulo),

              quantity:
                1,

              currency_id:
                "BRL",

              unit_price:
                Number(preco)

            }

          ],

          ...(email
            ? {
                payer: {
                  email:
                    String(email)
                }
              }
            : {})

        })

      }

    );


    /*
     * ========================================
     * RESPOSTA DO MERCADO PAGO
     * ========================================
     */

    const dados =
      await resposta.json();


    /*
     * ========================================
     * ERRO DO MERCADO PAGO
     * ========================================
     */

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

        details:
          dados

      });

    }


    /*
     * ========================================
     * LINK DE PAGAMENTO
     * ========================================
     */

    if (!dados.init_point) {

      return res.status(500).json({

        error:
          "Mercado Pago não retornou o link de pagamento"

      });

    }


    /*
     * ========================================
     * SUCESSO
     * ========================================
     */

    return res.status(200).json({

      id:
        dados.id,

      link:
        dados.init_point

    });


  } catch (erro) {

    /*
     * ========================================
     * ERRO GERAL
     * ========================================
     */

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
