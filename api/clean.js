import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // --- Handle preflight ---
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- Enforce POST ---
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text, mode } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No input text provided" });
    }

    let content = text;

    // --- If input is a URL, fetch article ---
    if (isValidUrl(text)) {
      const response = await fetch(text, {
        headers: {
          "User-Agent": "SummifyAI/1.0"
        }
      });

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      document
        .querySelectorAll("script, style, nav, footer, header")
        .forEach(el => el.remove());

      content = document.body.textContent
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 12000);
    }

    // --- TEMP RESPONSE (no AI yet) ---
    return res.status(200).json({
      mode: mode || "summary",
      result: content.slice(0, 1000) + "..."
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to clean input" });
  }
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
