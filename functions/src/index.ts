import * as functions from "firebase-functions";
import fetch from "node-fetch";
import cors from "cors";

const corsHandler = cors({origin: true});

export const translateText = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Método no permitido");
      return;
    }

    const {text} = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).send("Falta el texto a traducir");
      return;
    }

    const apiKey = process.env.DEEPL_KEY;
    if (!apiKey) {
      console.error('No se encontró la variable de entorno DEEPL_KEY');
      res.status(500).send('Configuración inválida');
      return;
    }

    try {
      const response = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          auth_key: apiKey,
          text: text,
          target_lang: "ES",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error DeepL:", errorText);
        res.status(500).send("Error en la traducción con DeepL");
        return;
      }

      const data = await response.json();
      const translated = data.translations?.[0]?.text || text;

      res.status(200).json({translated});
    } catch (error) {
      console.error("Error al traducir:", error);
      res.status(500).send("Error interno al traducir");
    }
  });
});
