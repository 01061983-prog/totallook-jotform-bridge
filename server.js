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
