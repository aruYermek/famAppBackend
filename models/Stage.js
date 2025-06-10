const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  _id: { type: String, required: true }, 
  title: { type: String, required: true }, 
  description: { type: String }, 
  order: { type: Number, required: true, unique: true }, 
});

module.exports = mongoose.model('Stage', StageSchema);