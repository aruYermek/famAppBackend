const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const Insight = require('../models/Insight');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    console.log('profileController - getUserProfile - User ID:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      console.log('profileController - getUserProfile - User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    const savedTests = await UserProgress.find({ userId: req.user._id }).populate('subtestId');
    const savedInsights = await UserProgress.find({ userId: req.user._id }).populate('insightsViewed');

    const profileData = {
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ')[1] || '',
      email: user.email,
      savedTests: savedTests.map(test => test.subtestId?.title || 'Unknown Test'),
      savedInsights: savedInsights.map(insight => insight.insightsViewed?.title || 'Unknown Insight'),
    };

    console.log('profileController - getUserProfile - Profile data:', profileData);
    res.json(profileData);
  } catch (err) {
    console.error('profileController - getUserProfile - Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    console.log('profileController - updateUserProfile - Request body:', req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('profileController - updateUserProfile - User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = `${firstName || ''} ${lastName || ''}`.trim();
    user.email = email || user.email;

    await user.save();
    console.log('profileController - updateUserProfile - Profile updated:', user);
    res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('profileController - updateUserProfile - Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout (no session storage on backend)
exports.logout = (req, res) => {
  console.log('profileController - logout - User ID:', req.user._id);
  res.json({ message: 'Logged out successfully' });
};