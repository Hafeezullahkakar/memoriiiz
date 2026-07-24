const Bookmark = require("../models/BookmarkModel");
const Article = require("../models/ArticleModel");

// Upsert-y: if already bookmarked, returns the existing row.
exports.create = async (req, res) => {
  try {
    const { articleId, notes } = req.body || {};
    if (!articleId) return res.status(400).json({ message: "articleId required" });

    const article = await Article.findById(articleId).select("_id").lean();
    if (!article) return res.status(404).json({ message: "Article not found" });

    const bookmark = await Bookmark.findOneAndUpdate(
      { articleId },
      { $setOnInsert: { articleId, status: "unread" }, $set: notes !== undefined ? { notes } : {} },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /bookmarks/:articleId — update status and/or notes.
exports.update = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { status, notes } = req.body || {};
    const patch = {};
    if (status === "read" || status === "unread") {
      patch.status = status;
      patch.readAt = status === "read" ? new Date() : null;
    }
    if (notes !== undefined) patch.notes = String(notes);
    if (!Object.keys(patch).length) return res.status(400).json({ message: "nothing to update" });

    const bookmark = await Bookmark.findOneAndUpdate(
      { articleId },
      { $set: patch },
      { new: true }
    );
    if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { articleId } = req.params;
    const deleted = await Bookmark.findOneAndDelete({ articleId });
    if (!deleted) return res.status(404).json({ message: "Bookmark not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
