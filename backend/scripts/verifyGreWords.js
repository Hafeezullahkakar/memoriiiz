const fs = require("fs");
const path = require("path");
const axios = require("axios");

const FILE =
  process.argv[2] ||
  "C:\\Users\\abdul\\OneDrive\\Desktop\\gre words\\GRE 500 Words.txt";

async function main() {
  const raw = fs.readFileSync(FILE, "utf8");
  const fileWords = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.+?)\s+[—–]\s+/);
      return m ? m[1].trim().toLowerCase() : null;
    })
    .filter(Boolean);

  const res = await axios.get("http://localhost:5000/api/getWordsByType/GRE");
  const dbWords = new Set(
    res.data.map((x) => (x.word || "").toLowerCase().trim())
  );

  const missing = fileWords.filter((w) => !dbWords.has(w));
  console.log("File words:", fileWords.length);
  console.log("DB GRE words:", dbWords.size);
  console.log("Missing from DB:", missing.length);
  if (missing.length) {
    missing.forEach((w) => console.log("  -", w));
  } else {
    console.log("✓ ALL FILE WORDS PRESENT IN DB");
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
