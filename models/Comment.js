const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  subtestId: {
    type: String,
    required: true,
  },
  minScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  comment: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Comment', CommentSchema);