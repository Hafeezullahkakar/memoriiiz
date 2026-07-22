import { jsPDF } from "jspdf";
import { parseMeaning } from "./parseMeaning";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Splits a paragraph into segments, marking target words with the index of the
// word in the provided list (so the PDF can render them as bold + superscript).
function tokenize(paragraph, words) {
  if (!paragraph || !words?.length) return [{ text: paragraph, refIndex: null }];
  const pattern = new RegExp(
    `\\b(${words.map((w) => escapeRegExp(w.word)).join("|")})[a-z]*\\b`,
    "gi"
  );
  const segments = [];
  let last = 0;
  let match;
  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > last) {
      segments.push({ text: paragraph.slice(last, match.index), refIndex: null });
    }
    const base = match[1].toLowerCase();
    const refIndex = words.findIndex((w) => w.word.toLowerCase() === base);
    segments.push({ text: match[0], refIndex: refIndex === -1 ? null : refIndex });
    last = pattern.lastIndex;
  }
  if (last < paragraph.length) {
    segments.push({ text: paragraph.slice(last), refIndex: null });
  }
  return segments;
}

// Draw a paragraph with bold target words + superscript reference numbers,
// then a Glossary section listing each word's definition and synonyms/antonyms.
function drawParagraph(doc, entry, opts) {
  const { pageWidth, margin, contentWidth } = opts;
  let y = opts.startY;
  const glossaryLineHeight = 5.5;

  // Header
  doc.setFontSize(9);
  doc.setTextColor(120);
  const date = entry.createdAt
    ? new Date(entry.createdAt).toLocaleString()
    : "";
  doc.text(date, margin, y);
  y += 5;

  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${entry.words?.length || 0} vocab words`, margin, y);
  y += 8;

  // Paragraph text with target words in bold + superscript numbers
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.setFont("helvetica", "normal");

  const segments = tokenize(entry.paragraph, entry.words || []);
  let x = margin;
  const spaceWidth = doc.getTextWidth(" ");
  const paragraphLineHeight = 6.5;

  const renderChunk = (chunkText, isTarget, refIdx) => {
    // Split on whitespace so each word wraps correctly.
    const tokens = chunkText.split(/(\s+)/);
    for (const tok of tokens) {
      if (!tok) continue;
      if (/^\s+$/.test(tok)) {
        x += spaceWidth;
        if (x > pageWidth - margin) {
          x = margin;
          y += paragraphLineHeight;
        }
        continue;
      }
      doc.setFont("helvetica", isTarget ? "bold" : "normal");
      const w = doc.getTextWidth(tok);
      if (x + w > pageWidth - margin) {
        x = margin;
        y += paragraphLineHeight;
      }
      if (y > 280) {
        doc.addPage();
        y = 20;
        x = margin;
      }
      doc.text(tok, x, y);
      x += w;
      if (isTarget && refIdx !== null) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(String(refIdx + 1), x, y - 2);
        x += doc.getTextWidth(String(refIdx + 1)) + 0.5;
        doc.setFontSize(12);
      }
    }
  };

  for (const seg of segments) {
    renderChunk(seg.text, seg.refIndex !== null, seg.refIndex);
  }
  y += paragraphLineHeight + 4;

  // Glossary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 120);
  doc.text("Glossary", margin, y);
  y += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(30);

  (entry.words || []).forEach((w, i) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    const { definition, synonyms, antonyms } = parseMeaning(w.meaning || "");

    doc.setFont("helvetica", "bold");
    const numLabel = `${i + 1}. `;
    doc.text(numLabel, margin, y);
    const numWidth = doc.getTextWidth(numLabel);
    doc.text(w.word, margin + numWidth, y);
    const wordWidth = doc.getTextWidth(w.word);

    doc.setFont("helvetica", "normal");
    const defText = ` — ${definition}`;
    const defLines = doc.splitTextToSize(defText, contentWidth - numWidth - wordWidth);
    doc.text(defLines[0], margin + numWidth + wordWidth, y);
    for (let li = 1; li < defLines.length; li++) {
      y += glossaryLineHeight;
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(defLines[li], margin + numWidth, y);
    }
    y += glossaryLineHeight;

    if (synonyms.length) {
      doc.setTextColor(30, 100, 30);
      const synText = `Synonyms: ${synonyms.join(", ")}`;
      const synLines = doc.splitTextToSize(synText, contentWidth - numWidth);
      synLines.forEach((line) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + numWidth, y);
        y += glossaryLineHeight;
      });
      doc.setTextColor(30);
    }
    if (antonyms.length) {
      doc.setTextColor(160, 30, 30);
      const antText = `Antonyms: ${antonyms.join(", ")}`;
      const antLines = doc.splitTextToSize(antText, contentWidth - numWidth);
      antLines.forEach((line) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin + numWidth, y);
        y += glossaryLineHeight;
      });
      doc.setTextColor(30);
    }
    y += 2;
  });

  return y;
}

export function generateParagraphPdf(entries, filename = "gre-practice.pdf") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 120);
  doc.text("Memoriiiz — GRE Practice", margin, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(
    `${entries.length} paragraph${entries.length === 1 ? "" : "s"}`,
    margin,
    26
  );

  let y = 34;
  entries.forEach((entry, idx) => {
    if (idx > 0) {
      doc.addPage();
      y = 20;
    }
    y = drawParagraph(doc, entry, {
      pageWidth,
      margin,
      contentWidth,
      startY: y,
    });
  });

  doc.save(filename);
}
