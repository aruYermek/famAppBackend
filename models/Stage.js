const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID (e.g., "stage1")
  title: { type: String, required: true }, // Name of the stage (e.g., "Stage 1")
  description: { type: String }, // Optional description
  order: { type: Number, required: true, unique: true }, // Order of the stage (1, 2, 3, 4)
});

module.exports = mongoose.model('Stage', StageSchema);