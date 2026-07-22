const axios = require("axios");
const Word = require("../models/WordModel");

// -----------------------------------------------------------------------------
// Provider: Gemini (Google) — untouched, kept as the default provider.
// -----------------------------------------------------------------------------

const GEMINI_MODEL = "gemini-flash-latest";
const geminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const callGemini = async ({ systemPrompt, messages, generationConfig }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
  };
  if (generationConfig) body.generationConfig = generationConfig;
  const response = await axios.post(
    `${geminiUrl(GEMINI_MODEL)}?key=${apiKey}`,
    body,
    { headers: { "Content-Type": "application/json" }, timeout: 55000 }
  );
  const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

// -----------------------------------------------------------------------------
// Provider: OpenCode (OpenAI-compatible) — activated when LLM_PROVIDER=opencode.
// -----------------------------------------------------------------------------

const OPENCODE_DEFAULT_BASE_URL = "https://opencode.ai/api/v1";
const OPENCODE_DEFAULT_MODEL_CHAT = "moonshotai/kimi-k2.6";
const OPENCODE_DEFAULT_MODEL_PARAGRAPH = "deepseek/deepseek-v4-flash-free";

const callOpenCode = async ({
  systemPrompt,
  messages,
  generationConfig,
  modelType,
}) => {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) throw new Error("OPENCODE_API_KEY not configured");
  const baseUrl = (
    process.env.OPENCODE_BASE_URL || OPENCODE_DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  const model =
    modelType === "paragraph"
      ? process.env.OPENCODE_MODEL_PARAGRAPH || OPENCODE_DEFAULT_MODEL_PARAGRAPH
      : process.env.OPENCODE_MODEL_CHAT || OPENCODE_DEFAULT_MODEL_CHAT;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model,
      messages: chatMessages,
      max_tokens: generationConfig?.maxOutputTokens,
      temperature: generationConfig?.temperature ?? 0.9,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 55000,
    }
  );

  const text = response?.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenCode");
  return text;
};

// -----------------------------------------------------------------------------
// Router: picks the provider based on LLM_PROVIDER env var.
// -----------------------------------------------------------------------------

const callLLM = async (args) => {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  if (provider === "opencode") return callOpenCode(args);
  return callGemini(args);
};

// -----------------------------------------------------------------------------
// Prompts + route handlers.
// -----------------------------------------------------------------------------

const SYSTEM_PROMPT =
  "You are a friendly English tutor helping a vocabulary learner. " +
  "Answer questions about English grammar, vocabulary, word meanings, " +
  "synonyms, antonyms, usage, and example sentences. Keep answers clear " +
  "and concise. Use markdown formatting (bold, lists, examples) when helpful. " +
  "If the question is not about English, politely steer the user back to " +
  "English learning.";

const PARAGRAPH_SYSTEM_PROMPT =
  "You are a GRE prep writer. Compose ONE cohesive paragraph in an academic " +
  "style that naturally uses EVERY word in the given list at least once " +
  "(inflections OK). Rules: (1) plain prose only — absolutely no markdown, " +
  "no asterisks, no headings, no list labels; (2) aim for roughly 15-25 " +
  "words of prose per vocab word; (3) return ONLY the paragraph — no " +
  "preamble like 'Here is' or 'Let me', no explanation, no closing note.";

exports.generateParagraph = async (req, res) => {
  const count = Math.max(
    5,
    Math.min(100, parseInt(req.body?.count, 10) || 20)
  );
  const status = req.body?.status || "To Learn";
  const type = req.body?.type || "GRE";

  try {
    const sample = await Word.aggregate([
      { $match: { type, status } },
      { $sample: { size: count } },
      { $project: { word: 1, meaning: 1, _id: 0 } },
    ]);

    if (!sample.length) {
      return res.status(404).json({
        message: `No "${status}" ${type} words found in the database.`,
      });
    }

    const words = sample.filter((w) => w.word);
    const userPrompt = `Words to include: ${words
      .map((w) => w.word)
      .join(", ")}`;

    // Generous headroom for prose + any reasoning tokens the model uses.
    const maxOutputTokens = Math.min(
      8192,
      Math.max(1024, words.length * 90)
    );

    const rawParagraph = await callLLM({
      systemPrompt: PARAGRAPH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      generationConfig: { maxOutputTokens, temperature: 0.9 },
      modelType: "paragraph",
    });

    // Strip stray markdown even when we asked for plain prose.
    const paragraph = rawParagraph
      .replace(/\*+/g, "")
      .replace(/^\s*[-•]\s+/gm, "")
      .replace(/\s+\n/g, "\n")
      .trim();

    return res.json({ paragraph, words });
  } catch (err) {
    const status = err.response?.status || 500;
    const detail =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      "Unknown error";
    return res.status(status).json({ message: `Generation error: ${detail}` });
  }
};

exports.ask = async (req, res) => {
  const { messages, question } = req.body || {};

  let chatMessages;
  if (Array.isArray(messages) && messages.length) {
    chatMessages = messages;
  } else if (typeof question === "string" && question.trim()) {
    chatMessages = [{ role: "user", content: question.trim() }];
  } else {
    return res
      .status(400)
      .json({ message: "Provide 'messages' array or 'question' string" });
  }

  try {
    const answer = await callLLM({
      systemPrompt: SYSTEM_PROMPT,
      messages: chatMessages,
      modelType: "chat",
    });
    return res.json({ answer });
  } catch (err) {
    const status = err.response?.status || 500;
    const detail =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      "Unknown error";
    return res.status(status).json({ message: `LLM error: ${detail}` });
  }
};
