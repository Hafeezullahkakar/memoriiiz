const express = require("express");
const router = express.Router();
const articles = require("../controllers/ArticleController");
const bookmarks = require("../controllers/BookmarkController");
const feeds = require("../controllers/FeedController");

// Articles
router.get("/articles", articles.list);
router.get("/articles/stats", articles.stats);
router.get("/articles/sources", articles.sources);
router.post("/articles/refresh", articles.refresh);
router.get("/articles/:id", articles.getOne);

// Bookmarks
router.post("/bookmarks", bookmarks.create);
router.patch("/bookmarks/:articleId", bookmarks.update);
router.delete("/bookmarks/:articleId", bookmarks.remove);

// Feeds (configured RSS sources)
router.get("/feeds", feeds.list);
router.post("/feeds", feeds.create);
router.patch("/feeds/:id", feeds.update);
router.delete("/feeds/:id", feeds.remove);

module.exports = router;
