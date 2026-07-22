const axios = require("axios");
const Word = require("../models/WordModel");

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const callGemini = async ({ systemPrompt, contents }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const response = await axios.post(
    `${GEMINI_ENDPOINT}?key=${apiKey}`,
    {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
    },
    { headers: { "Content-Type": "application/json" } }
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
  "You are a GRE prep writer. Given a list of GRE vocabulary words, " +
  "compose a single cohesive paragraph in an academic, GRE-reading-passage " +
  "style. Requirements: (1) use EVERY given word at least once, in its " +
  "natural grammatical form (inflections and tense changes are fine); " +
  "(2) keep the paragraph coherent with a clear theme; (3) prefer complex " +
  "but readable sentences; (4) do not use markdown, headings, or lists — " +
  "output plain prose only; (5) do not label or list the words separately; " +
  "(6) target roughly 30-50 words of prose per vocabulary word. Return " +
  "ONLY the paragraph, no preamble or explanation.";

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

    const paragraph = await callGemini({
      systemPrompt: PARAGRAPH_SYSTEM_PROMPT,
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
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
