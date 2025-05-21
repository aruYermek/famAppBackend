const UserProgress = require('../models/UserProgress');
const Stage = require('../models/Stage');
const Subtest = require('../models/Subtest');


// Save test results
// backend/controllers/resultsController.js
exports.saveTestResult = async (req, res) => {
  try {
    const { userId, testId, answers } = req.body; // Убрали score, так как он вычисляется
    console.log('📡 Received POST /api/results with body:', req.body);

    if (!userId || !testId || !answers || !Array.isArray(answers)) {
      console.log('❌ Missing or invalid required fields:', { userId, testId, answers });
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    const subtests = await Subtest.find({ stageId: testId });
    if (!subtests || subtests.length === 0) {
      console.log('❌ No subtests found for testId:', testId);
      return res.status(404).json({ message: 'No subtests found for this stage' });
    }

    const progressEntries = [];
    for (const subtest of subtests) {
      const subtestAnswers = answers.filter(a => a.subtestId === subtest._id.toString());
      if (subtestAnswers.length === 0) continue;

      const subcategoryScores = await Promise.all(
        subtest.subcategories.map(async (subcategory) => {
          const subcategoryQuestions = subtest.questions.filter(q => q.subcategory === subcategory);
          const questionIds = subcategoryQuestions.map(q => q._id.toString());
          const relevantAnswers = subtestAnswers.filter(a => questionIds.includes(a.questionId));
          const totalScore = relevantAnswers.reduce((sum, a) => sum + a.answer, 0);
          const averageScore = totalScore / relevantAnswers.length;
          const percentageScore = ((averageScore - 1) / 4) * 100;

          const commentDoc = await Comment.findOne({
            subtestId: subtest._id,
            minScore: { $lte: percentageScore },
            maxScore: { $gte: percentageScore },
          });

          return {
            subcategory,
            score: percentageScore,
            comment: commentDoc ? commentDoc.comment : 'No comment available',
          };
        })
      );

      const overallScore = subcategoryScores.reduce((sum, cat) => sum + cat.score, 0) / subcategoryScores.length;

      progressEntries.push({
        userId,
        subtestId: subtest._id,
        testName: subtest.title,
        score: Math.round(overallScore),
        subcategories: subcategoryScores,
        answers: subtestAnswers.reduce((acc, a) => ({ ...acc, [a.questionId]: a.answer }), {}),
        completedAt: new Date(),
        eligibleForRetakeAt: new Date(Date.now() + (subtest.cooldownDays || 90) * 24 * 60 * 60 * 1000),
      });
    }

    if (progressEntries.length === 0) {
      console.log('❌ No valid answers match subtest questions:', { subtests, answers });
      return res.status(400).json({ message: 'No valid answers match subtest questions' });
    }

    const insertedEntries = await UserProgress.insertMany(progressEntries);
    console.log('📡 Inserted entries:', insertedEntries);

    res.status(201).json({ message: 'Results saved successfully', userId });
  } catch (error) {
    console.error('❌ Error saving test result:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get results for individual subtests
exports.getUserResults = async (req, res) => {
  try {
    const results = await UserProgress.find({ userId: req.params.userId }).populate('subtestId');
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No results found for this user' });
    }
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get overall results across all stages with descriptions
exports.getOverallResults = async (req, res) => {
  try {
    const userId = req.params.userId;
    const results = await UserProgress.find({ userId }).populate('subtestId');

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No results found for this user' });
    }

    // Group results by stages
    const stages = await Stage.find().sort({ order: 1 });
    const stageResults = await Promise.all(
      stages.map(async (stage) => {
        const subtests = await Subtest.find({ stageId: stage._id });
        const subtestIds = subtests.map(subtest => subtest._id);
        const stageProgress = results.filter(progress => subtestIds.includes(progress.subtestId._id));

        if (stageProgress.length === 0) {
          return {
            stageId: stage._id,
            stageTitle: stage.title,
            averageScore: null,
            subtests: [],
          };
        }

        const subtestScores = stageProgress.map(progress => ({
          subtestId: progress.subtestId._id,
          subtestTitle: progress.subtestId.title,
          score: progress.score,
          subcategories: progress.subcategories,
        }));

        const averageStageScore =
          stageProgress.reduce((sum, progress) => sum + progress.score, 0) / stageProgress.length;

        return {
          stageId: stage._id,
          stageTitle: stage.title,
          averageScore: averageStageScore,
          subtests: subtestScores,
        };
      })
    );

    // Calculate overall score (average of stage scores)
    const validStages = stageResults.filter(stage => stage.averageScore !== null);
    const overallScore =
      validStages.length > 0
        ? validStages.reduce((sum, stage) => sum + stage.averageScore, 0) / validStages.length
        : null;

    // Generate descriptions based on score levels
    const descriptions = validStages.map(stage => {
      const subtests = stage.subtests.map(subtest => {
        let level, description;
        if (subtest.score >= 75) {
          level = 'High';
          description = getDescription(subtest.subtestId, 'high');
        } else if (subtest.score >= 50) {
          level = 'Medium';
          description = getDescription(subtest.subtestId, 'medium');
        } else {
          level = 'Low';
          description = getDescription(subtest.subtestId, 'low');
        }
        return {
          subtestTitle: subtest.subtestTitle,
          score: subtest.score,
          level,
          description,
          subcategories: subtest.subcategories,
        };
      });

      return {
        stageTitle: stage.stageTitle,
        averageScore: stage.averageScore,
        subtests,
      };
    });

    res.status(200).json({
      overallScore,
      stages: descriptions,
    });
  } catch (error) {
    console.error('Error fetching overall results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get description based on subtest and level
function getDescription(subtestId, level) {
  const descriptions = {
    'emotional-maturity': {
      high: 'You have a high level of emotional awareness, can manage your feelings, and empathize with others.',
      medium: 'You strive for emotional maturity but sometimes struggle to control emotions or recognize internal states.',
      low: 'Emotions often control you. It’s important to learn to recognize and manage your feelings and consider others’ emotions.',
    },
    'financial-readiness': {
      high: 'You confidently manage your finances and are ready to handle a shared budget in a relationship.',
      medium: 'You understand financial basics but need to develop consistent habits, especially in joint planning.',
      low: 'Focus on learning financial literacy basics and shared financial responsibility in a family.',
    },
    'communication-skills': {
      high: 'You listen well, speak directly, and resolve conflicts constructively.',
      medium: 'You make efforts in communication, but some barriers prevent deep mutual understanding.',
      low: 'Expressing thoughts, listening, and resolving conflicts are challenging. Developing these skills is crucial for relationships.',
    },
    'stress-resilience': {
      high: 'You handle difficulties calmly and don’t let stress harm relationships.',
      medium: 'You try to adapt to stress but may react emotionally in certain situations.',
      low: 'Coping with stress is difficult, which may lead to burnout and relationship issues.',
    },
    'value-alignment': {
      high: 'You clearly understand what you want from family life, and your values align with a shared future.',
      medium: 'You have a general direction but need to discuss expectations and values with your partner.',
      low: 'You need to define what family, children, and shared goals mean before building a partnership.',
    },
  };

  return descriptions[subtestId]?.[level] || 'Description not available';
}