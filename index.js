import express from "express";
import cors from "cors";

const app = express();

/* CORS */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.options("*", cors());

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("SummifyAI backend is running");
});

/* MAIN API ROUTE */
app.post("/api/clean", async (req, res) => {
  const { text, mode } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  // TEMP RESPONSE (to confirm CORS works)
  res.json({
    result: `Mode: ${mode}\n\nCleaned content:\n${text.slice(0, 200)}...`
  });
});

/* REQUIRED FOR VERCEL */
export default app;
