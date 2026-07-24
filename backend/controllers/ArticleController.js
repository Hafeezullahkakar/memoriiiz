const Parser = require("rss-parser");
const Article = require("../models/ArticleModel");
const Bookmark = require("../models/BookmarkModel");
const Feed = require("../models/FeedModel");

// -----------------------------------------------------------------------------
// RSS parser + feed refresh.
// -----------------------------------------------------------------------------

const REFRESH_THRESHOLD_MS = 30 * 60 * 1000; // 30 min — opportunistic refresh cadence
const PER_FEED_TIMEOUT_MS = 10 * 1000;       // stop waiting on any single slow feed

const parser = new Parser({
  timeout: PER_FEED_TIMEOUT_MS,
  headers: {
    "User-Agent":
      "MemoriiizReader/1.0 (+https://memoriiiz.vercel.app; personal reader)",
  },
});

// Prefer image URL from any of the shapes RSS/Atom uses.
const extractImage = (item) => {
  if (item?.enclosure?.url && (item.enclosure.type || "").startsWith("image/")) {
    return item.enclosure.url;
  }
  if (item?.["media:content"]?.$?.url) return item["media:content"].$.url;
  if (item?.itunes?.image) return item.itunes.image;
  const html = item?.["content:encoded"] || item?.content || item?.contentSnippet || "";
  const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
};

const stripHtml = (s) =>
  String(s || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

const upsertArticle = async (feed, item) => {
  const url = item.link || item.id || item.guid;
  if (!url) return { added: false, updated: false };

  const title = (item.title || "").trim();
  if (!title) return { added: false, updated: false };

  const rawExcerpt = item.contentSnippet || item.summary || item.content || "";
  const excerpt = truncate(stripHtml(rawExcerpt), 320);

  const publishedAt = item.isoDate
    ? new Date(item.isoDate)
    : item.pubDate
    ? new Date(item.pubDate)
    : new Date();

  const tags = Array.isArray(item.categories)
    ? item.categories.map((c) => (typeof c === "string" ? c : c?._ || "")).filter(Boolean).slice(0, 8)
    : [];

  // HN feed puts a Points value in the comments URL when known; keep null for others.
  const commentsUrl = item.comments || null;

  const doc = {
    url,
    title,
    excerpt,
    source: feed.name,
    sourceHomepage: feed.homepage || "",
    author: item.creator || item.author || null,
    publishedAt,
    fetchedAt: new Date(),
    image: extractImage(item),
    tags,
    commentsUrl,
  };

  const existing = await Article.findOne({ url }).select("_id").lean();
  if (existing) {
    // Only refresh mutable metadata; keep original url + createdAt.
    await Article.updateOne(
      { _id: existing._id },
      { $set: { title, excerpt, image: doc.image, tags, author: doc.author } }
    );
    return { added: false, updated: true };
  }
  await Article.create(doc);
  return { added: true, updated: false };
};

const refreshOneFeed = async (feed) => {
  const result = { feed: feed.name, added: 0, updated: 0, error: null };
  try {
    const parsed = await parser.parseURL(feed.url);
    const items = Array.isArray(parsed?.items) ? parsed.items.slice(0, 60) : [];
    for (const item of items) {
      const r = await upsertArticle(feed, item);
      if (r.added) result.added++;
      if (r.updated) result.updated++;
    }
    await Feed.updateOne(
      { _id: feed._id },
      { $set: { lastFetchedAt: new Date(), lastFetchError: null } }
    );
  } catch (err) {
    result.error = err.message || String(err);
    await Feed.updateOne(
      { _id: feed._id },
      { $set: { lastFetchError: result.error, lastFetchedAt: new Date() } }
    );
  }
  return result;
};

// Fire-and-forget: don't await. Errors are swallowed (logged only).
let backgroundRefreshInFlight = false;
const kickBackgroundRefresh = () => {
  if (backgroundRefreshInFlight) return;
  backgroundRefreshInFlight = true;
  (async () => {
    try {
      const feeds = await Feed.find({ enabled: true }).lean();
      await Promise.allSettled(feeds.map((f) => refreshOneFeed(f)));
    } catch (e) {
      console.error("background refresh failed:", e.message);
    } finally {
      backgroundRefreshInFlight = false;
    }
  })();
};

// -----------------------------------------------------------------------------
// Route handlers.
// -----------------------------------------------------------------------------

exports.list = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const { source, bookmarked, status, q } = req.query;

    const filter = {};
    if (source) filter.source = source;
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: re }, { excerpt: re }];
    }

    // Bookmark filter first (to shrink the article query).
    let articleIdFilter = null;
    if (bookmarked === "true" || status === "unread" || status === "read") {
      const bmQuery = {};
      if (status === "read" || status === "unread") bmQuery.status = status;
      const bms = await Bookmark.find(bmQuery).select("articleId status").lean();
      articleIdFilter = bms.map((b) => b.articleId);
      filter._id = { $in: articleIdFilter };
    } else if (bookmarked === "false") {
      const bms = await Bookmark.find().select("articleId").lean();
      filter._id = { $nin: bms.map((b) => b.articleId) };
    }

    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    // Attach bookmark state per article.
    const ids = items.map((i) => i._id);
    const bookmarks = await Bookmark.find({ articleId: { $in: ids } }).lean();
    const bmByArticle = new Map(bookmarks.map((b) => [String(b.articleId), b]));
    const enriched = items.map((a) => ({
      ...a,
      bookmark: bmByArticle.get(String(a._id)) || null,
    }));

    // Opportunistic refresh: any feed older than the threshold triggers a
    // background poll. First call after inactivity returns cached data;
    // subsequent calls see the fresh rows.
    const stale = await Feed.exists({
      enabled: true,
      $or: [
        { lastFetchedAt: null },
        { lastFetchedAt: { $lt: new Date(Date.now() - REFRESH_THRESHOLD_MS) } },
      ],
    });
    if (stale) kickBackgroundRefresh();

    res.json({
      items: enriched,
      total,
      offset,
      limit,
      refreshing: backgroundRefreshInFlight,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ message: "Not found" });
    const bookmark = await Bookmark.findOne({ articleId: article._id }).lean();
    res.json({ ...article, bookmark: bookmark || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const feeds = await Feed.find({ enabled: true }).lean();
    if (!feeds.length) return res.json({ fetched: 0, added: 0, updated: 0, feeds: [] });

    const settled = await Promise.allSettled(feeds.map((f) => refreshOneFeed(f)));
    const results = settled.map((s, i) =>
      s.status === "fulfilled"
        ? s.value
        : { feed: feeds[i].name, added: 0, updated: 0, error: s.reason?.message || "unknown" }
    );
    const added = results.reduce((n, r) => n + r.added, 0);
    const updated = results.reduce((n, r) => n + r.updated, 0);
    res.json({ fetched: feeds.length, added, updated, feeds: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Small stats endpoint for the Reads page header.
exports.stats = async (_req, res) => {
  try {
    const [total, bookmarks, unread] = await Promise.all([
      Article.estimatedDocumentCount(),
      Bookmark.countDocuments(),
      Bookmark.countDocuments({ status: "unread" }),
    ]);
    res.json({ total, bookmarked: bookmarks, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Distinct source names, for the source filter dropdown.
exports.sources = async (_req, res) => {
  try {
    const names = await Article.distinct("source");
    res.json(names.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
