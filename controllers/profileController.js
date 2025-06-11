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

   
    const savedInsights = await UserProgress.find({ userId: req.user._id }).populate('insightsViewed');

    const profileData = {
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ')[1] || '',
      email: user.email,
       savedInsights: user.savedArticles.map(article => ({ _id: article._id, title: article.title })),
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

// Удаление аккаунта пользователя
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('profileController - deleteUserAccount - User ID:', userId);

    // Удаляем все данные пользователя
    await UserProgress.deleteMany({ userId });  
    await Insight.deleteMany({ userId });       

    // Удаляем самого пользователя
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      console.log('profileController - deleteUserAccount - User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('profileController - deleteUserAccount - User deleted:', userId);
    res.json({ message: 'Account deleted successfully' });

  } catch (err) {
    console.error('profileController - deleteUserAccount - Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

