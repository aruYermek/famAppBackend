const Subtest = require('../models/Subtest');
const UserProgress = require('../models/UserProgress');
const Comment = require('../models/Comment');
const Stage = require('../models/Stage');
const TestResult = require('../models/TestResult');


// Get all subtests for a given stage
exports.getSubtests = async (req, res) => {
  try {
    const subtests = await Subtest.find({ stageId: req.params.stageId });
    if (!subtests || subtests.length === 0) {
      return res.status(404).json({ message: 'No subtests found for this stage' });
    }
    res.status(200).json(subtests);
  } catch (error) {
    console.error('Error fetching subtests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get details of a specific subtest
exports.getSubtest = async (req, res) => {
  try {
    const subtest = await Subtest.findOne({ _id: req.params.subtestId });
    if (!subtest) {
      return res.status(404).json({ message: 'Subtest not found' });
    }
    res.status(200).json(subtest);
  } catch (error) {
    console.error('Error fetching subtest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all questions for a stage, mixed randomly
exports.getStageQuestions = async (req, res) => {
  try {
    const stageId = req.params.stageId;
    const subtests = await Subtest.find({ stageId });

    if (!subtests || subtests.length === 0) {
      return res.status(404).json({ message: 'No subtests found for this stage' });
    }

    let allQuestions = [];
    subtests.forEach(subtest => {
      subtest.questions.forEach(question => {
        allQuestions.push({
          subtestId: subtest._id,
          subtestTitle: subtest.title,
          questionId: question._id,
          question: question.question,
          subcategory: question.subcategory,
          options: question.options,
        });
      });
    });

    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    res.status(200).json(allQuestions);
  } catch (error) {
    console.error('Error fetching stage questions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.submitStageTest = async (req, res) => {
  try {
    const { stageId, answers } = req.body;
    const userId = req.user._id;
    if (!stageId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid request: stageId and answers are required' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user ID' });
    }

    const results = answers.reduce((acc, answer) => {
      const subtestId = answer.subtestId;
      if (!acc[subtestId]) {
        acc[subtestId] = { subtestId, scores: [] };
      }
      acc[subtestId].scores.push(answer.answer || 0);
      return acc;
    }, {});

    const subtestIds = Object.keys(results);
    const subtests = await Subtest.find({ _id: { $in: subtestIds } });
    if (!subtests || subtests.length === 0) {
      return res.status(404).json({ message: 'No subtests found for provided IDs' });
    }


    const stage = await Stage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ message: `Stage with ID ${stageId} not found` });
    }

    const progressEntries = [];
    const formattedResults = await Promise.all(
      Object.values(results).map(async (subtest) => {
        const subtestData = subtests.find((s) => s._id.toString() === subtest.subtestId) || {};
        const overallScore = subtest.scores.length
          ? Math.round((subtest.scores.reduce((sum, s) => sum + s, 0) / subtest.scores.length) * 20)
          : 0;

        const subcategories = await Promise.all(
          subtest.scores.map(async (score, index) => {
            const question = subtestData.questions?.[index] || {};
            const scaledScore = score * 20 || 0;
            const subcategory = question.subcategory || subtestData.title || subtest.subtestId;
            const commentDoc = await Comment.findOne({
              subcategory,
              minScore: { $lte: scaledScore },
              maxScore: { $gte: scaledScore },
            });
            return {
              subcategory,
              score: scaledScore,
              comment: commentDoc ? commentDoc.comment : 'No comment available',
            };
          })
        );

        await UserProgress.deleteMany({ userId, subtestId: subtest.subtestId });
        progressEntries.push({
          userId,
          subtestId: subtest.subtestId,
          stageId,
          stageTitle: stage.title || 'Unknown Stage',
          testName: subtestData.title || subtest.subtestId,
          score: overallScore,
          subcategories,
          answers: subtest.scores.reduce((acc, score, idx) => {
            const question = subtestData.questions?.[idx];
            return question ? { ...acc, [question._id]: score } : acc;
          }, {}),
          completedAt: new Date(),
          eligibleForRetakeAt: new Date(Date.now() + (subtestData.cooldownDays || 1) * 24 * 60 * 60 * 1000),
        });

        return {
          subtestId: subtest.subtestId,
          subtestTitle: subtestData.title || subtest.subtestId,
          overallScore,
          subcategories,
        };
      })
    );

    if (progressEntries.length > 0) {
      await UserProgress.insertMany(progressEntries);
    }

    const testResult = new TestResult({
      userId,
      stageId,
      results: formattedResults,
      submittedAt: new Date(),
    });
    await testResult.save();

    res.json({ message: 'Stage test submitted successfully', results: formattedResults });
  } catch (error) {
    console.error('Error submitting test:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get all subtests
exports.getAllSubtests = async (req, res) => {
  try {
    const subtests = await Subtest.find();
    if (!subtests || subtests.length === 0) {
      return res.status(404).json({ message: 'No subtests found' });
    }
    res.status(200).json(subtests);
  } catch (error) {
    console.error('Error fetching all subtests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getStages = async (req, res) => {
  try {
    const stages = await Stage.find().sort({ order: 1 });
    if (!stages || stages.length === 0) {
      return res.status(404).json({ message: 'No stages found' });
    }

    const stagesWithQuestions = await Promise.all(
      stages.map(async (stage) => {
        const subtests = await Subtest.find({ stageId: stage._id });
        const questionCount = subtests.reduce((total, subtest) => {
          return total + (subtest.questions?.length || 0);
        }, 0);
        return {
          ...stage._doc,
          questionCount,
        };
      })
    );

    res.status(200).json(stagesWithQuestions);
  } catch (error) {
    console.error('Error fetching stages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};