// server.js — Bridge Jotform per Totallook

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Middleware base
app.use(cors());
app.use(express.json());

// Config Jotform
const JOTFORM_API_KEY = process.env.JOTFORM_API_KEY;
const JOTFORM_FORM_ID = process.env.JOTFORM_FORM_ID;
const JOTFORM_BASE_URL = "https://api.jotform.com";

// Endpoint di test
app.get("/", (req, res) => {
  res.send("totallook-jotform-bridge OK");
});

// ===============================
// GET /jotform/clients
// Legge TUTTE le submission del form come "clienti"
// ===============================
app.get("/jotform/clients", async (req, res) => {
  if (!JOTFORM_API_KEY || !JOTFORM_FORM_ID) {
    return res.status(500).json({ ok: false, error: "Config mancante" });
  }

  try {
    const allSubmissions = [];
    let offset = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(
        `${JOTFORM_BASE_URL}/form/${JOTFORM_FORM_ID}/submissions`,
        {
          params: {
            apiKey: JOTFORM_API_KEY,
            limit,
            offset,
          },
        }
      );

      const content = response.data && response.data.content
        ? response.data.content
        : [];

      allSubmissions.push(...content);

      if (content.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return res.json({ ok: true, submissions: allSubmissions });
  } catch (err) {
    console.error("Errore Jotform GET:", err.response?.data || err.message);
    return res.status(500).json({ ok: false, error: "Errore Jotform GET" });
  }
});

// ===============================
// POST /jotform/clients
// Crea un nuovo "cliente" (nuova submission Jotform)
// ===============================
app.post("/jotform/clients", async (req, res) => {
  const { nome, telefono, email } = req.body || {};

  if (!JOTFORM_API_KEY || !JOTFORM_FORM_ID) {
    return res.status(500).json({ ok: false, error: "Config mancante" });
  }
  if (!nome) {
    return res.status(400).json({ ok: false, error: "Nome mancante" });
  }

  // Split nome in first / last: ultimo pezzo = cognome
  const parts = nome.trim().split(/\s+/);
  const last = parts.pop();
  const first = parts.join(" ");

  try {
    const url = `${JOTFORM_BASE_URL}/form/${JOTFORM_FORM_ID}/submissions`;
    const payload = new URLSearchParams();

    // Campo 5 = Nome Cognome (Name)
    payload.append("submission[5][first]", first);
    payload.append("submission[5][last]", last);

    // Campo 6 = Telefono
    if (telefono) payload.append("submission[6]", telefono);

    // Campo 7 = Email
    if (email) payload.append("submission[7]", email);

    const response = await axios.post(url, payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: { apiKey: JOTFORM_API_KEY },
    });

    return res.json({ ok: true, result: response.data });
  } catch (err) {
    console.error("Errore Jotform POST:", err.response?.data || err.message);
    return res.status(500).json({ ok: false, error: "Errore Jotform POST" });
  }
});

// ===============================
// PUT /jotform/clients/:id
// Modifica una submission esistente (cliente)
// ===============================
app.put("/jotform/clients/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, telefono, email } = req.body || {};

  if (!JOTFORM_API_KEY) {
    return res.status(500).json({ ok: false, error: "Config mancante" });
  }
  if (!id || !nome) {
    return res.status(400).json({ ok: false, error: "Dati mancanti" });
  }

  const parts = nome.trim().split(/\s+/);
  const last = parts.pop();
  const first = parts.join(" ");

  try {
    const url = `${JOTFORM_BASE_URL}/submission/${id}`;
    const payload = new URLSearchParams();

    payload.append("submission[5][first]", first);
    payload.append("submission[5][last]", last);

    if (telefono !== undefined) payload.append("submission[6]", telefono);
    if (email !== undefined) payload.append("submission[7]", email);

    const response = await axios.post(url, payload.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        apiKey: JOTFORM_API_KEY,
        method: "PUT",
      },
    });

    return res.json({ ok: true, result: response.data });
  } catch (err) {
    console.error("Errore Jotform PUT:", err.response?.data || err.message);
    return res.status(500).json({ ok: false, error: "Errore Jotform PUT" });
  }
});

// ===============================
// DELETE /jotform/clients/:id
// Elimina una submission (cliente)
// ===============================
app.delete("/jotform/clients/:id", async (req, res) => {
  const { id } = req.params;

  if (!JOTFORM_API_KEY) {
    return res.status(500).json({ ok: false, error: "Config mancante" });
  }
  if (!id) {
    return res.status(400).json({ ok: false, error: "ID mancante" });
  }

  try {
    const url = `${JOTFORM_BASE_URL}/submission/${id}`;
    const response = await axios.delete(url, {
      params: { apiKey: JOTFORM_API_KEY },
    });

    return res.json({ ok: true, result: response.data });
  } catch (err) {
    console.error("Errore Jotform DELETE:", err.response?.data || err.message);
    return res.status(500).json({ ok: false, error: "Errore Jotform DELETE" });
  }
});

// Avvio server (per Render usa PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`totallook-jotform-bridge in ascolto sulla porta ${PORT}`);
});
