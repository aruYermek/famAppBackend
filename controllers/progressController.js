const UserProgress = require('../models/UserProgress');
const Subtest = require('../models/Subtest');
const Stage = require('../models/Stage');

exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const stages = await Stage.find().sort({ order: 1 });
    const totalSubtests = await Subtest.countDocuments();

    
    const userProgress = await UserProgress.aggregate([
      { $match: { userId } },
      { $sort: { completedAt: -1 } },
      {
        $group: {
          _id: '$subtestId',
          doc: { $first: '$$ROOT' }, 
        },
      },
      { $replaceRoot: { newRoot: '$doc' } }, 
      {
        $lookup: {
          from: 'subtests',
          localField: 'subtestId',
          foreignField: '_id',
          as: 'subtest',
        },
      },
      { $unwind: '$subtest' },
    ]);

    const stageResults = await Promise.all(
      stages.map(async (stage) => {
        const subtests = await Subtest.find({ stageId: stage._id });
        const subtestIds = subtests.map(subtest => subtest._id.toString());
        const stageProgress = userProgress.filter(progress =>
          subtestIds.includes(progress.subtestId.toString())
        );


        const completedSubtests = stageProgress.length;
        const totalSubtestsInStage = subtests.length;
        const progressPercentage = totalSubtestsInStage > 0 ? (completedSubtests / totalSubtestsInStage) * 100 : 0;

        const validScores = stageProgress.filter(p => p.score > 0).map(p => p.score);
        const averageStageScore =
          validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : null;

        const subtestDetails = stageProgress.map(progress => ({
          subtestId: progress.subtestId,
          title: progress.subtest.title,
          score: progress.score,
          subcategories: progress.subcategories,
          completedAt: progress.completedAt,
        }));

        return {
          stageId: stage._id,
          title: stage.title,
          overallScore: averageStageScore ? Math.round(averageStageScore) : null,
          progress: Math.round(progressPercentage),
          subtests: subtestDetails,
        };
      })
    );

    const totalCompletedSubtests = userProgress.length;
    const overallProgress = totalSubtests > 0 ? (totalCompletedSubtests / totalSubtests) * 100 : 0;

    const progressData = {
      stages: stageResults,
      overallProgress: Math.round(overallProgress),
    };

    res.json(progressData);
  } catch (err) {
    console.error('Error fetching user progress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};