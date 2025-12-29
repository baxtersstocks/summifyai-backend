import fetch from "node-fetch";
import { JSDOM } from "jsdom";

function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

async function fetchUrlText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "SummifyAI/1.0" }
  });

  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  doc.querySelectorAll("script, style, nav, footer, header").forEach(el => el.remove());

  return doc.body.textContent.replace(/\s+/g, " ").slice(0, 12000);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  const { inputs, mode } = req.body;

  const processed = [];

  for (const input of inputs) {
    if (isUrl(input)) {
      try {
        const text = await fetchUrlText(input);
        processed.push(text);
      } catch {
        processed.push("Failed to fetch URL content.");
      }
    } else {
      processed.push(input);
    }
  }

  const prompt = `
Summarize and organize this content clearly.

MODE: ${mode}

CONTENT:
${processed.join("\n\n")}
`;

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await aiRes.json();

  res.status(200).json({
    output: data.choices[0].message.content
  });
}
