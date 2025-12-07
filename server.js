const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const JOTFORM_FORM_ID = process.env.JOTFORM_FORM_ID || "253326869734065";

const JOTFORM_BASE_URL = "https://eu-api.jotform.com";

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/jotform/clients", async (req, res) => {
  if (!JOTFORM_API_KEY) {
    return res.status(500).json({ ok: false, error: "API key mancante" });
  }

  try {
    const response = await axios.get(
      `${JOTFORM_BASE_URL}/form/${JOTFORM_FORM_ID}/submissions`,
      {
        params: { apiKey: JOTFORM_API_KEY, limit: 1000, offset: 0 },
      }
    );

    res.json({ ok: true, submissions: response.data.content });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      details: err.response?.data,
    });
  }
});

app.listen(PORT, () => {
  console.log("Jotform bridge attivo su Render");
});
