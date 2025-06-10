const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const tokenWithoutBearer = token.replace('Bearer ', '');

    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    console.log('📡 Decoded token:', decoded); 

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = { id: user._id.toString(), _id: user._id.toString() };
    console.log('📡 Set req.user._id:', req.user._id); 

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};