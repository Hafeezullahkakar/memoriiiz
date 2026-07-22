// Extracts definition / synonyms / antonyms from a meaning string that follows
// the pattern: "Definition. Synonyms: a, b. Antonym: c."
// Falls back to plain definition if no markers are present.
export function parseMeaning(text) {
  if (!text) return { definition: "", synonyms: [], antonyms: [] };
  const synIdx = text.search(/\bSynonyms?:/i);
  const antIdx = text.search(/\bAntonyms?:/i);
  const cutoff = [synIdx, antIdx]
    .filter((i) => i !== -1)
    .sort((a, b) => a - b)[0];
  const definition = (cutoff !== undefined ? text.slice(0, cutoff) : text)
    .trim()
    .replace(/[.\s]+$/, "");
  const synMatch = text.match(/\bSynonyms?:\s*([^.]+)/i);
  const antMatch = text.match(/\bAntonyms?:\s*([^.]+)/i);
  const splitList = (s) =>
    s
      .split(/[,;]/)
      .map((x) => x.trim())
      .filter(Boolean);
  return {
    definition,
    synonyms: synMatch ? splitList(synMatch[1]) : [],
    antonyms: antMatch ? splitList(antMatch[1]) : [],
  };
}
