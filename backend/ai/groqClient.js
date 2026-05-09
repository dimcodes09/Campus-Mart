const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

const askGroq = async (userPrompt, temperature = 0.7) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for CampusMart, a student marketplace. " +
            "Return ONLY valid JSON. No explanation. No markdown. No extra text.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim();

  if (!raw) {
    throw new Error("Groq returned an empty response.");
  }

  const clean = raw.replace(/^```json|^```|```$/gm, "").trim();

  try {
    return JSON.parse(clean);
  } catch (error) {
    throw new Error(`Groq returned invalid JSON: ${clean}`);
  }
};

module.exports = { askGroq };
