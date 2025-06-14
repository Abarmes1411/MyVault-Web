import * as functions from "firebase-functions";
import fetch from "node-fetch";
import cors from "cors";

// Importa y configura el middleware CORS para permitir solicitudes desde cualquier origen.
const corsHandler = cors({origin: true});

// Exporta una función HTTP de Firebase que traduce texto utilizando la API de DeepL.
export const translateText = functions.https.onRequest((req, res) => {
  // Aplica el middleware CORS antes de procesar la solicitud.
  corsHandler(req, res, async () => {
    // Verifica que el metodo HTTP sea POST.
    if (req.method !== "POST") {
      res.status(405).send("Método no permitido");
      return;
    }

    // Extrae el campo 'text' del cuerpo de la solicitud.
    const {text} = req.body;

    // Valida que el campo 'text' exista y sea una cadena de texto.
    if (!text || typeof text !== "string") {
      res.status(400).send("Falta el texto a traducir");
      return;
    }

    // Obtiene la clave de la API de DeepL desde las variables de entorno.
    const apiKey = process.env.DEEPL_KEY;
    if (!apiKey) {
      console.error("No se encontró la variable de entorno DEEPL_KEY");
      res.status(500).send("Configuración inválida");
      return;
    }

    try {
      // Realiza la solicitud a la API de DeepL para traducir el texto al español.
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

      // Verifica si la respuesta fue exitosa. Si no, devuelve un error.
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error DeepL:", errorText);
        res.status(500).send("Error en la traducción con DeepL");
        return;
      }

      // Extrae el texto traducido de la respuesta JSON.
      const data = await response.json();
      const translated = data.translations?.[0]?.text || text;

      // Devuelve el texto traducido en formato JSON.
      res.status(200).json({translated});
    } catch (error) {
      // Captura y muestra cualquier error durante el proceso de traducción.
      console.error("Error al traducir:", error);
      res.status(500).send("Error interno al traducir");
    }
  });
});

// Exporta una función HTTP de Firebase que genera un resumen de reseñas usando OpenAI.
export const generateSummary = functions.https.onRequest((req, res) => {
  // Aplica el middleware CORS antes de procesar la solicitud.
  corsHandler(req, res, async () => {
    // Verifica que el metodo HTTP sea POST.
    if (req.method !== "POST") {
      res.status(405).send("Método no permitido");
      return;
    }

    // Extrae el array de reseñas del cuerpo de la solicitud.
    const {reviews} = req.body;

    // Valida que se reciban al menos 3 reseñas en un array.
    if (!Array.isArray(reviews) || reviews.length < 3) {
      res.status(400).json({error: "Se requieren al menos 3 reseñas"});
      return;
    }

    // Obtiene la clave de la API de OpenAI desde las variables de entorno.
    const apiKey = process.env.OPENAI_KEY;
    if (!apiKey) {
      console.error("No se encontró la variable OPENAI_KEY");
      res.status(500).json({error: "Configuración de OpenAI inválida"});
      return;
    }

    // Prompt que se le enviará a la IA para generar el resumen.
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
      // Realiza la solicitud a la API de OpenAI para generar el resumen.
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

      // Verifica si la respuesta fue exitosa. Si no, devuelve un error.
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error OpenAI:", errorText);
        res.status(500).json({error: "Error al generar resumen"});
        return;
      }

      // Extrae el resumen generado por la IA de la respuesta JSON.
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.trim();

      // Verifica que el resumen exista antes de devolverlo.
      if (!summary) {
        res.status(500).send("No se obtuvo resumen");
        return;
      }

      // Devuelve el resumen en formato JSON.
      res.status(200).json({summary});
    } catch (error) {
      // Captura y muestra cualquier error durante el proceso de generación.
      console.error("Error al generar resumen:", error);
      res.status(500).json({error: "Error al generar resumen"});
    }
  });
});
