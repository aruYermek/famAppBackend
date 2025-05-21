const UserProgress = require('../models/UserProgress');
const Subtest = require('../models/Subtest');
const Insight = require('../models/Insight');
const User = require('../models/User');
 
// Get user's progress in stages, subtests, and insights
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;  // From the authenticated user
    
    // Get the completed subtests
    const completedSubtests = await UserProgress.find({ userId }).populate('subtestId');
    const completedSubtestTitles = completedSubtests.map((item) => item.subtestId.title);
    
    // Get insights viewed by the user
    const viewedInsights = await UserProgress.find({ userId }).populate('insightsViewed');
    const viewedInsightTitles = viewedInsights.map((item) => item.insightsViewed.title);
    
    // Get the total number of subtests and insights
    const totalSubtests = await Subtest.countDocuments();
    const totalInsights = await Insight.countDocuments();
    
    // Calculate progress
    const subtestProgress = (completedSubtests.length / totalSubtests) * 100;
    const insightProgress = (viewedInsights.length / totalInsights) * 100;

    // Prepare response data
    const progressData = {
      name: req.user.name,
      completedSubtests: completedSubtestTitles,
      completedInsights: viewedInsightTitles,
      subtestProgress: Math.round(subtestProgress), // percentage
      insightProgress: Math.round(insightProgress), // percentage
    };

    res.json(progressData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};