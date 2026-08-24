export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Método não permitido"
    });

  }

  try {

    const publicKey =
      process.env.MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {

      return res.status(500).json({
        error:
          "MERCADOPAGO_PUBLIC_KEY não configurado na Vercel."
      });

    }

    const {
      titulo,
      preco,
      email,
      dados
    } = req.body || {};

    if (!titulo) {

      return res.status(400).json({
        error: "Produto não informado."
      });

    }

    if (!email) {

      return res.status(400).json({
        error: "E-mail não informado."
      });

    }

    /*
    ========================================
    RETORNA A PUBLIC KEY PARA O SITE
    ========================================
    */

    return res.status(200).json({

      publicKey:

        publicKey,

      titulo:
        titulo,

      preco:
        Number(preco)

    });

  } catch (erro) {

    console.error(
      "ERRO CRIAR PAGAMENTO:",
      erro
    );

    return res.status(500).json({

      error:
        "Erro interno ao preparar pagamento.",

      details:
        erro.message

    });

  }

}
