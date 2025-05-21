const Insight = require('../models/Insight');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

exports.getFeaturedInsights = async (req, res) => {
  try {
    const insights = await Insight.find().sort({ createdAt: -1 }).limit(4);
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Получить все артикли для страницы "Посмотреть все"
exports.getAllInsights = async (req, res) => {
  try {
    const insights = await Insight.find().sort({ createdAt: -1 });
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.getInsightById = async (req, res) => {
  try {
    const { id } = req.params;
    // Проверяем, является ли id валидным ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid insight ID' });
    }
    const insight = await Insight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    res.json(insight);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// ✅ Get all insights for a specific category
exports.getInsightsByCategory = async (req, res) => {
  try {
    const { category } = req.params;  // Get category from URL (e.g., "Emotions")
    
    const insights = await Insight.find({ category }).sort({ createdAt: -1 });

    if (!insights.length) {
      return res.status(404).json({ message: 'No insights found for this category' });
    }

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Mark an insight as viewed by the user
exports.markInsightAsViewed = async (req, res) => {
  try {
    const { insightId } = req.params;  // Get insight ID from URL
    const userId = req.user._id; // Get user ID from the authentication middleware

    const insight = await Insight.findById(insightId);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    // Check if the user has already viewed the insight
    if (insight.viewedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already viewed this insight' });
    }

    // Add the user to the "viewedBy" array
    insight.viewedBy.push(userId);
    await insight.save();

    // Find or create a UserProgress entry for this user
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({
        userId,
        subtestId: null,
        score: null,
        completedAt: null,
        eligibleForRetakeAt: null,
        insightsViewed: [],
      });
    }

    // Add the insight to the user's progress
    if (!progress.insightsViewed.includes(insightId)) {
      progress.insightsViewed.push(insightId);
      await progress.save();
    }

    res.json({ message: 'Insight marked as viewed', insight });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.saveInsight = async (req, res) => {
  try {
    const { insightId } = req.params;
    const userId = req.user._id; // Из middleware auth

    const insight = await Insight.findById(insightId);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    const user = await User.findById(userId);
    if (!user.savedArticles.includes(insightId)) {
      user.savedArticles.push(insightId);
      await user.save();
    }

    res.json({ message: 'Insight saved', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.unsaveInsight = async (req, res) => {
  try {
    const { insightId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedArticles = user.savedArticles.filter(id => id.toString() !== insightId);
    await user.save();

    res.json({ message: 'Insight unsaved', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSavedArticles = async (req, res) => {
  try {
    const userId = req.user._id; // Получаем ID пользователя из middleware auth
    const user = await User.findById(userId).populate('savedArticles'); // Популируем данные артиклей
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ savedArticles: user.savedArticles });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};