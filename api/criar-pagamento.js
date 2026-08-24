export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {

    const {
      titulo,
      preco,
      email,
      dados
    } = req.body || {};

    if (!titulo) {
      return res.status(400).json({
        error: "Produto não informado"
      });
    }

    const valor = Number(preco);

    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({
        error: "Preço inválido"
      });
    }

    if (!email || !String(email).includes("@")) {
      return res.status(400).json({
        error: "E-mail inválido"
      });
    }

    const publicKey =
      process.env.MERCADOPAGO_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({
        error:
          "MERCADOPAGO_PUBLIC_KEY não configurada na Vercel"
      });
    }

    return res.status(200).json({

      publicKey,

      titulo: String(titulo),

      preco: valor,

      email: String(email),

      dados: dados || {}

    });

  } catch (erro) {

    console.error(
      "ERRO NA API:",
      erro
    );

    return res.status(500).json({

      error:
        "Erro interno na API",

      details:
        erro.message

    });

  }

}
