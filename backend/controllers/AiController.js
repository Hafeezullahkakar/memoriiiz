const axios = require("axios");
const Word = require("../models/WordModel");

const GEMINI_MODEL = "gemini-flash-latest";
const geminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const callGemini = async ({ systemPrompt, contents, generationConfig, model }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
  };
  if (generationConfig) body.generationConfig = generationConfig;
  const response = await axios.post(
    `${geminiUrl(model || GEMINI_MODEL)}?key=${apiKey}`,
    body,
    { headers: { "Content-Type": "application/json" }, timeout: 55000 }
  );
  const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

const SYSTEM_PROMPT =
  "You are a friendly English tutor helping a vocabulary learner. " +
  "Answer questions about English grammar, vocabulary, word meanings, " +
  "synonyms, antonyms, usage, and example sentences. Keep answers clear " +
  "and concise. Use markdown formatting (bold, lists, examples) when helpful. " +
  "If the question is not about English, politely steer the user back to " +
  "English learning.";

const toGeminiContents = (messages) =>
  messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

const PARAGRAPH_SYSTEM_PROMPT =
  "You are a GRE prep writer. Compose ONE tight, cohesive paragraph in an " +
  "academic style that naturally uses EVERY given word at least once " +
  "(inflections OK). Rules: plain prose only (no markdown, no headings, no " +
  "list labels); keep it concise — aim for about 12-18 words of prose per " +
  "vocab word; return ONLY the paragraph, no preamble.";

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

    // Cap output tokens roughly to what we need (~1.5 tokens per word).
    // This keeps Gemini fast enough to fit within Vercel Hobby's 10s cap.
    const maxOutputTokens = Math.min(2048, Math.max(256, words.length * 30));

    const paragraph = await callGemini({
      systemPrompt: PARAGRAPH_SYSTEM_PROMPT,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens, temperature: 0.9 },
    });

    return res.json({ paragraph: paragraph.trim(), words });
  } catch (err) {
    const status = err.response?.status || 500;
    const detail =
      err.response?.data?.error?.message || err.message || "Unknown error";
    return res.status(status).json({ message: `Generation error: ${detail}` });
  }
};

exports.ask = async (req, res) => {
  const { messages, question } = req.body || {};

  let contents;
  if (Array.isArray(messages) && messages.length) {
    contents = toGeminiContents(messages);
  } else if (typeof question === "string" && question.trim()) {
    contents = [{ role: "user", parts: [{ text: question.trim() }] }];
  } else {
    return res
      .status(400)
      .json({ message: "Provide 'messages' array or 'question' string" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "GEMINI_API_KEY is not configured on the server" });
  }

  try {
    const answer = await callGemini({
      systemPrompt: SYSTEM_PROMPT,
      contents,
    });
    return res.json({ answer });
  } catch (err) {
    const status = err.response?.status || 500;
    const detail =
      err.response?.data?.error?.message || err.message || "Unknown error";
    return res.status(status).json({ message: `Gemini error: ${detail}` });
  }
};
