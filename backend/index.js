// app.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const wordRoutes = require("./routes/WordRoute");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors()
);

app.use(bodyParser.json());

mongoose
  .connect(`mongodb+srv://hafeezullah2023:hafeezullah2023@cluster0.vddszir.mongodb.net/memoriiiz`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((r) => console.log("Connected to DB successfully!"));

app.use("/api", wordRoutes);

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});