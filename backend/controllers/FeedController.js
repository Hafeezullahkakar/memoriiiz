const Feed = require("../models/FeedModel");

exports.list = async (_req, res) => {
  try {
    const feeds = await Feed.find().sort({ name: 1 }).lean();
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, url, homepage } = req.body || {};
    if (!name || !url) return res.status(400).json({ message: "name and url required" });
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: "url must be a valid URL" });
    }
    const feed = await Feed.create({
      name: String(name).trim(),
      url: String(url).trim(),
      homepage: homepage ? String(homepage).trim() : "",
    });
    res.status(201).json(feed);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Feed already exists" });
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = {};
    if (typeof req.body?.enabled === "boolean") patch.enabled = req.body.enabled;
    if (typeof req.body?.name === "string") patch.name = req.body.name.trim();
    if (typeof req.body?.homepage === "string") patch.homepage = req.body.homepage.trim();
    if (!Object.keys(patch).length) return res.status(400).json({ message: "nothing to update" });
    const feed = await Feed.findByIdAndUpdate(id, { $set: patch }, { new: true });
    if (!feed) return res.status(404).json({ message: "Feed not found" });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Feed.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Feed not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
