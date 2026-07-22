const fs = require("fs");
const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.lookup = function patchedLookup(hostname, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  const all = opts?.all;
  dns.resolve4(hostname, (err, addrs) => {
    if (!err && addrs && addrs.length) {
      return all
        ? cb(null, addrs.map((a) => ({ address: a, family: 4 })))
        : cb(null, addrs[0], 4);
    }
    dns.resolve6(hostname, (err6, addrs6) => {
      if (!err6 && addrs6 && addrs6.length) {
        return all
          ? cb(null, addrs6.map((a) => ({ address: a, family: 6 })))
          : cb(null, addrs6[0], 6);
      }
      cb(err || err6 || new Error(`No DNS records for ${hostname}`));
    });
  });
};

const Word = require("../models/WordModel");

const MONGO_URI =
  "mongodb+srv://hafeezullah2023:hafeezullah2023@cluster0.vddszir.mongodb.net/memoriiiz";

const DEFAULT_FILE =
  "C:\\Users\\abdul\\OneDrive\\Desktop\\gre words\\GRE 500 Words.txt";

const filePath = process.argv[2] || DEFAULT_FILE;

function parseLine(line) {
  // Format: "word — meaning text with . Synonyms: a, b. Antonym: c."
  // Split on the em-dash / en-dash surrounded by whitespace.
  const m = line.match(/^(.+?)\s+[—–]\s+(.+)$/);
  if (!m) return null;
  const word = m[1].trim().toLowerCase();
  const meaning = m[2].trim();
  if (!word || !meaning) return null;
  return { word, meaning };
}

async function main() {
  console.log(`Reading: ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  console.log(`Found ${lines.length} non-empty lines`);

  const ops = [];
  const skipped = [];
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      skipped.push(line);
      continue;
    }
    ops.push({
      updateOne: {
        filter: { word: parsed.word, type: "GRE" },
        update: {
          $set: {
            word: parsed.word,
            meaning: parsed.meaning,
            type: "GRE",
          },
          $setOnInsert: {
            status: "To Learn",
            sentences: [],
            picture: "",
            video: "",
          },
        },
        upsert: true,
      },
    });
  }

  console.log(`Parsed ${ops.length} words, skipped ${skipped.length}`);
  if (skipped.length) {
    console.log("Skipped lines:");
    skipped.forEach((s) => console.log("  -", s));
  }

  if (!ops.length) {
    console.log("Nothing to insert. Exiting.");
    return;
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected. Running bulkWrite...");

  const result = await Word.bulkWrite(ops, { ordered: false });
  console.log("Result:", {
    upserted: result.upsertedCount,
    modified: result.modifiedCount,
    matched: result.matchedCount,
  });

  const total = await Word.countDocuments({ type: "GRE" });
  console.log(`Total GRE words in DB now: ${total}`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
