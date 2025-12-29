import fetch from "node-fetch";
import { JSDOM } from "jsdom";

/* =========================
   CORS HELPER
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://baxtersstocks.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/* =========================
   UTILS
========================= */
function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

async function fetchArticleText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "SummifyAI/1.0" }
  });

  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Remove junk
  doc.querySelectorAll("script, style, nav, footer, header, noscript").forEach(el => el.remove());

  const text = doc.body.textContent || "";
  return text.replace(/\s+/g, " ").trim().slice(0, 12000);
}

/* =========================
   API HANDLER
========================= */
export default async function handler(req, res) {
  setCors(res);

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { text, mode } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No input provided" });
    }

    let content = text;

    if (isUrl(text)) {
      content = await fetchArticleText(text);
    }

    // VERY simple “cleaning” for now
    let result;
    switch (mode) {
      case "timeline":
        result = content.split(". ").slice(0, 10).map((s, i) => `${i + 1}. ${s}`).join("\n");
        break;
      case "eli5":
        result = content.slice(0, 800);
        break;
      case "investor":
        result = content.slice(0, 1000);
        break;
      case "drama":
        result = content.slice(0, 900);
        break;
      default:
        result = content.slice(0, 1200);
    }

    return res.status(200).json({ result });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
