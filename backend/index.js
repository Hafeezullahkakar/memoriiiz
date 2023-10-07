// app.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const wordRoutes = require("./routes/WordRoute");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(bodyParser.json());

mongoose
  .connect(`${process.env.MONGO_URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((r) => console.log("Connected to DB successfully!"));

app.use("/api", wordRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
