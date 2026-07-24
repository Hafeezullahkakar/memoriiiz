// Seed the Feed collection with a starter set of tech RSS/Atom sources.
// Idempotent — safe to run multiple times (upserts by URL).
//
//   node scripts/seedFeeds.js

const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// DNS workaround for local ISPs that can't resolve Mongo Atlas SRV records.
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

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://hafeezullah2023:hafeezullah2023@cluster0.vddszir.mongodb.net/memoriiiz";

const Feed = require("../models/FeedModel");

const DEFAULT_FEEDS = [
  {
    name: "Pragmatic Engineer",
    url: "https://newsletter.pragmaticengineer.com/feed",
    homepage: "https://newsletter.pragmaticengineer.com",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com/rss",
    homepage: "https://news.ycombinator.com",
  },
  {
    name: "Dev.to",
    url: "https://dev.to/feed",
    homepage: "https://dev.to",
  },
  {
    name: "GitHub Blog",
    url: "https://github.blog/feed/",
    homepage: "https://github.blog",
  },
  {
    name: "Stack Overflow Blog",
    url: "https://stackoverflow.blog/feed/",
    homepage: "https://stackoverflow.blog",
  },
  {
    name: "Julia Evans",
    url: "https://jvns.ca/atom.xml",
    homepage: "https://jvns.ca",
  },
  {
    name: "Overreacted (Dan Abramov)",
    url: "https://overreacted.io/rss.xml",
    homepage: "https://overreacted.io",
  },
  {
    name: "Rachel by the Bay",
    url: "https://rachelbythebay.com/w/atom.xml",
    homepage: "https://rachelbythebay.com",
  },
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    homepage: "https://techcrunch.com",
  },
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log("Connected to Mongo. Seeding feeds…");
    let created = 0;
    let updated = 0;
    for (const f of DEFAULT_FEEDS) {
      const existing = await Feed.findOne({ url: f.url });
      if (existing) {
        // Update name/homepage in case the seed list changed.
        await Feed.updateOne(
          { _id: existing._id },
          { $set: { name: f.name, homepage: f.homepage } }
        );
        updated++;
        console.log(`  ~ ${f.name}`);
      } else {
        await Feed.create(f);
        created++;
        console.log(`  + ${f.name}`);
      }
    }
    console.log(`\nDone. ${created} created, ${updated} updated.`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();
