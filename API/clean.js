import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  // 🔐 REQUIRED CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Block non-POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text, mode } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No input provided" });
    }

    let content = text;

    // 🌐 If input is a URL, scrape it
    if (text.startsWith("http")) {
      const response = await fetch(text, {
        headers: { "User-Agent": "SummifyAI/1.0" }
      });

      const html = await response.text();
      const dom = new JSDOM(html);

      // Remove junk
      dom.window.document
        .querySelectorAll("script, style, nav, footer, header")
        .forEach(el => el.remove());

      content = dom.window.document.body.textContent
        .replace(/\s+/g, " ")
        .trim();
    }

    // 🧪 TEMP RESPONSE (proves everything works)
    return res.status(200).json({
      result: `MODE: ${mode || "summary"}\n\n${content.slice(0, 1500)}...`
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
