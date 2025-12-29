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
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { text, mode } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // TEMP test response (no AI yet)
  return res.status(200).json({
    success: true,
    mode,
    result: `CLEANED (${mode}): ${text.slice(0, 120)}...`
  });
}
