const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

// Local router DNS can't resolve MongoDB Atlas SRV/A records.
// Only apply this workaround in local dev — Vercel/prod resolvers are fine
// and monkey-patching dns.lookup there causes cold-start timeouts.
if (!process.env.VERCEL) {
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
}
const wordRoutes = require("./routes/WordRoute");
const userRoutes = require("./routes/UserRoute");
const aiRoutes = require("./routes/AiRoute");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(bodyParser.json());

mongoose
  .connect(
    `mongodb+srv://hafeezullah2023:hafeezullah2023@cluster0.vddszir.mongodb.net/memoriiiz`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((r) => console.log("Connected to DB successfully!"))
  .catch((err) =>
    console.error(
      "MongoDB connection failed (AI route still works):",
      err.message
    )
  );

app.use("/api", wordRoutes);
app.use("/api/ai", aiRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
