const Recommendation = require('../models/Recommendations');

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find().sort({ createdAt: -1 }).limit(3);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body; 
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const recommendation = await Recommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    recommendation.status = status;
    await recommendation.save();
    res.json({ message: 'Status updated', recommendation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};