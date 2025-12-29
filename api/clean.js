import fetch from "node-fetch";
import { JSDOM } from "jsdom";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function fetchUrlText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "SummifyAI/1.0" }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  doc.querySelectorAll("script, style, nav, footer, header").forEach(el => el.remove());

  return doc.body.textContent.replace(/\s+/g, " ").trim().slice(0, 12000);
}

export default async function handler(req, res) {
  setCors(res);

  // ✅ Handle preflight FIRST
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text, mode } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    let cleanedText = text;

    if (text.startsWith("http")) {
      cleanedText = await fetchUrlText(text);
    }

    return res.status(200).json({
      result: `[${mode || "summary"}]\n\n${cleanedText}`
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
