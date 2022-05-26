const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: String,
  image: {
    public_id: String,
    url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.ObjectId, ref: "User" },
      comment: { type: String, require: true },
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);
