const axios = require("axios");
const Word = require("../models/WordModel");
const Paragraph = require("../models/ParagraphModel");

// -----------------------------------------------------------------------------
// Provider: Gemini (Google) — default provider.
// -----------------------------------------------------------------------------

const GEMINI_MODEL = "gemini-flash-latest";
const geminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const callGemini = async ({ systemPrompt, messages, generationConfig, jsonMode }) => {
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
  const config = { ...(generationConfig || {}) };
  if (jsonMode) config.responseMimeType = "application/json";
  if (Object.keys(config).length) body.generationConfig = config;
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
// Provider: OpenCode (OpenAI-compatible) — LLM_PROVIDER=opencode.
// -----------------------------------------------------------------------------

const OPENCODE_DEFAULT_BASE_URL = "https://opencode.ai/zen/v1";
const OPENCODE_DEFAULT_MODEL_CHAT = "glm-5.2";
const OPENCODE_DEFAULT_MODEL_PARAGRAPH = "deepseek-v4-flash-free";

const callOpenCode = async ({
  systemPrompt,
  messages,
  generationConfig,
  modelType,
  jsonMode,
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

  const body = {
    model,
    messages: chatMessages,
    max_tokens: generationConfig?.maxOutputTokens,
    temperature: generationConfig?.temperature ?? 0.9,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const response = await axios.post(`${baseUrl}/chat/completions`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    timeout: 55000,
  });

  const text = response?.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenCode");
  return text;
};

// -----------------------------------------------------------------------------
// Provider: Groq (OpenAI-compatible) — LLM_PROVIDER=groq (production default).
// -----------------------------------------------------------------------------

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_DEFAULT_MODEL_CHAT = "llama-3.3-70b-versatile";
const GROQ_DEFAULT_MODEL_PARAGRAPH = "llama-3.3-70b-versatile";

const callGroq = async ({ systemPrompt, messages, generationConfig, modelType, jsonMode }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");
  const model =
    modelType === "paragraph"
      ? process.env.GROQ_MODEL_PARAGRAPH || GROQ_DEFAULT_MODEL_PARAGRAPH
      : process.env.GROQ_MODEL_CHAT || GROQ_DEFAULT_MODEL_CHAT;

  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const body = {
    model,
    messages: chatMessages,
    max_tokens: generationConfig?.maxOutputTokens,
    temperature: generationConfig?.temperature ?? 0.9,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const response = await axios.post(`${GROQ_BASE_URL}/chat/completions`, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    timeout: 55000,
  });

  const text = response?.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");
  return text;
};

// -----------------------------------------------------------------------------
// Router.
// -----------------------------------------------------------------------------

const callLLM = async (args) => {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  if (provider === "groq") return callGroq(args);
  if (provider === "opencode") return callOpenCode(args);
  return callGemini(args);
};

// -----------------------------------------------------------------------------
// Prompts + helpers.
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

const PARAGRAPH_WITH_MCQS_SYSTEM_PROMPT = `You are a GRE prep writer. Given a list of vocabulary words, produce two things:

1) ONE cohesive academic paragraph (plain prose, no markdown) that naturally uses EVERY word in the list at least once (inflections OK). Aim for ~15-25 words of prose per vocab word.

2) Then 8 to 10 GRE-style multiple-choice questions that test comprehension of the vocabulary words in the passage.

Return ONLY a valid JSON object with this exact shape (no code fence, no preamble, no trailing text):

{
  "paragraph": "the paragraph as plain prose",
  "mcqs": [
    {
      "question": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "one-sentence justification"
    }
  ]
}

MCQ requirements:
- Exactly 4 options per question.
- correctIndex is 0..3.
- 8 to 10 questions total.
- Focus on the meaning / usage of the vocabulary words in the passage.
- Use question styles like: "In the passage, 'X' most nearly means:", "Which choice best replaces 'X' as used in the passage?", "The author's use of 'X' most strongly suggests:", or short "select the best synonym / antonym" prompts.
- Distractors should be plausible (related but wrong nuance), not obviously wrong.
- Do not repeat the same vocabulary word across too many questions — spread coverage.

Output must be pure JSON. No backticks, no "Here is", no explanation outside the JSON.`;

// Robust JSON extraction — tolerates code fences and stray text around JSON.
const extractJson = (text) => {
  if (!text) throw new Error("empty response");
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ``` fences if present.
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Fallback: pull the outermost {...} block.
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch (_e) {}
    }
    throw new Error("JSON parse failed");
  }
};

// Normalize + validate an MCQ list from the LLM. Discards malformed items.
const sanitizeMcqs = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => {
      if (!m || typeof m.question !== "string") return null;
      if (!Array.isArray(m.options) || m.options.length !== 4) return null;
      const options = m.options.map((o) => String(o).trim()).filter(Boolean);
      if (options.length !== 4) return null;
      const idx = Number(m.correctIndex);
      if (!Number.isInteger(idx) || idx < 0 || idx > 3) return null;
      return {
        question: m.question.trim(),
        options,
        correctIndex: idx,
        explanation: typeof m.explanation === "string" ? m.explanation.trim() : "",
      };
    })
    .filter(Boolean)
    .slice(0, 12);
};

// -----------------------------------------------------------------------------
// Route handlers.
// -----------------------------------------------------------------------------

exports.generateParagraph = async (req, res) => {
  const count = Math.max(
    5,
    Math.min(100, parseInt(req.body?.count, 10) || 20)
  );
  const status = req.body?.status || "To Learn";
  // `type` is optional now that GRE + General are unified. If omitted, we
  // sample from all words matching the status; pass "GRE" or "General"
  // explicitly to restrict.
  const type = req.body?.type || null;
  const withMcqs = !!req.body?.withMcqs;

  try {
    const match = { status };
    if (type) match.type = type;
    const sample = await Word.aggregate([
      { $match: match },
      { $sample: { size: count } },
      { $project: { word: 1, meaning: 1 } },
    ]);

    if (!sample.length) {
      return res.status(404).json({
        message: `No "${status}"${type ? ` ${type}` : ""} words found in the database.`,
      });
    }

    const words = sample
      .filter((w) => w.word)
      .map((w) => ({ _id: w._id, word: w.word, meaning: w.meaning }));
    const userPrompt = `Words to include: ${words.map((w) => w.word).join(", ")}`;

    // JSON mode needs extra headroom for the MCQ payload.
    const maxOutputTokens = Math.min(
      8192,
      Math.max(1024, words.length * (withMcqs ? 220 : 90))
    );

    const rawResponse = await callLLM({
      systemPrompt: withMcqs ? PARAGRAPH_WITH_MCQS_SYSTEM_PROMPT : PARAGRAPH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      generationConfig: { maxOutputTokens, temperature: withMcqs ? 0.7 : 0.9 },
      modelType: "paragraph",
      jsonMode: withMcqs,
    });

    let paragraph;
    let mcqs = [];

    if (withMcqs) {
      try {
        const parsed = extractJson(rawResponse);
        paragraph = String(parsed.paragraph || "").trim();
        mcqs = sanitizeMcqs(parsed.mcqs);
      } catch (parseErr) {
        console.error("MCQ JSON parse failed:", parseErr.message);
        // Fall back to treating the raw response as plain paragraph text.
        paragraph = rawResponse;
      }
    } else {
      paragraph = rawResponse;
    }

    // Strip stray markdown artefacts even when we asked for plain prose.
    paragraph = String(paragraph || "")
      .replace(/\*+/g, "")
      .replace(/^\s*[-•]\s+/gm, "")
      .replace(/\s+\n/g, "\n")
      .trim();

    if (!paragraph) {
      return res.status(502).json({ message: "Model returned no paragraph." });
    }

    // Persist. Save failures shouldn't kill the response.
    let saved;
    try {
      saved = await Paragraph.create({
        paragraph,
        words: words.map((w) => ({
          wordId: w._id,
          word: w.word,
          meaning: w.meaning,
        })),
        mcqs,
        count: words.length,
        provider: (process.env.LLM_PROVIDER || "gemini").toLowerCase(),
      });
    } catch (saveErr) {
      console.error("Failed to persist paragraph:", saveErr.message);
    }

    return res.json({
      _id: saved?._id,
      paragraph,
      words,
      mcqs,
      createdAt: saved?.createdAt,
    });
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
