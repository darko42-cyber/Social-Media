const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "backend/config/config.env" });
}
//! using middlewares
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cookieParser());
//todo importing route
const post = require("./routes/post");
const user = require("./routes/user");
//? using route
app.use("/api/v1", post);
app.use("/api/v1", user);
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});
module.exports = app;
