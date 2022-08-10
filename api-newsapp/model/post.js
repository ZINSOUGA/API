const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
  title: { type: String },
  img: { type: String },
  description: { type: String },
  comment: { type: String }, 
});

module.exports = mongoose.model("post", postSchema);
