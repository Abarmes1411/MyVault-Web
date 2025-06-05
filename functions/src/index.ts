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
      console.error("No se encontró la variable de entorno DEEPL_KEY");
      res.status(500).send("Configuración inválida");
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


export const generateSummary = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Método no permitido");
      return;
    }

    const {reviews} = req.body;

    if (!Array.isArray(reviews) || reviews.length < 3) {
      res.status(400).json({error: "Se requieren al menos 3 reseñas"});
      return;
    }

    const apiKey = process.env.OPENAI_KEY;
    if (!apiKey) {
      console.error("No se encontró la variable OPENAI_KEY");
      res.status(500).json({error: "Configuración de OpenAI inválida"});
      return;
    }

    const prompt = `
    Eres un crítico profesional de cine, series, anime, manga,
    videojuegos y novelas ligeras.
    Resume de forma muy concisa y objetiva lo que piensan los usuarios
    sobre esta obra, en un párrafo de máximo 2 líneas.
    Usa un estilo neutral, sin opiniones propias.

    Estas son algunas reseñas:

    ${reviews.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}

    Devuelve solo el resumen en español,
    en un único párrafo corto de 2 líneas como máximo.
    `;


    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system",
              content: "Eres un crítico profesional de entretenimiento"},
            {role: "user", content: prompt},
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error OpenAI:", errorText);
        res.status(500).json({error: "Error al generar resumen"});
        return;
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.trim();

      if (!summary) {
        res.status(500).send("No se obtuvo resumen");
        return;
      }

      res.status(200).json({summary});
    } catch (error) {
      console.error("Error al generar resumen:", error);
      res.status(500).json({error: "Error al generar resumen"});
    }
  });
});
