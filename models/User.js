const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  age: { type: Number }, 
  gender: { type: String, enum: ['Male', 'Female', 'Prefer not to say'] }, 
  relationshipStatus: { type: String, enum: ['Single', 'In a relationship', 'Married', 'Divorced'] }, 
  hasChildren: { type: Boolean }, 
  numberOfChildren: { type: Number },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  savedArticles: [{ type: String, ref: 'Insight' }],
});

 
module.exports = mongoose.model('User', UserSchema);