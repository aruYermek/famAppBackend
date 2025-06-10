const Stage = require('../models/Stage');
const Subtest = require('../models/Subtest');
const UserProgress = require('../models/UserProgress');

exports.getStageTree = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📡 Fetching stage tree for userId:', userId);

    const stages = await Stage.find().sort({ order: 1 });
    const subtests = await Subtest.find();
    const userProgress = await UserProgress.find({ userId });

    const tree = stages.map((stage) => {
      const stageSubtests = subtests.filter(
        (subtest) => subtest.stageId === stage._id
      );
      const subtestDetails = stageSubtests.map((subtest) => {
        const progress = userProgress.find(
          (p) => p.subtestId === subtest._id
        );
        return {
          subtestId: subtest._id,
          title: subtest.title,
          score: progress ? progress.score : 0,
          completedAt: progress ? progress.completedAt : null,
        };
      });

      const validScores = subtestDetails
        .filter((st) => st.score > 0)
        .map((st) => st.score);
      const overallScore =
        validScores.length > 0
          ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
          : 0;

      return {
        stageId: stage._id,
        title: stage.title,
        overallScore: Math.round(overallScore),
        subtests: subtestDetails,
      };
    });

    console.log('📡 Stage tree:', tree);
    res.status(200).json(tree);
  } catch (error) {
    console.error('❌ Error fetching stage tree:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};