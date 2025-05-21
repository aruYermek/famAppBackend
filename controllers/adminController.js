const Stage = require('../models/Stage');
const Subtest = require('../models/Subtest');

exports.getAllSubtests = async (req, res) => {
  try {
    const subtests = await Subtest.find();
    res.status(200).json(subtests);
  } catch (error) {
    console.error('Error fetching subtests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new stage
exports.createStage = async (req, res) => {
  try {
    const { title, description, order } = req.body;

    if (!title || !order) {
      return res.status(400).json({ message: 'Title and order are required' });
    }

    const existingStage = await Stage.findOne({ order });
    if (existingStage) {
      return res.status(400).json({ message: 'Stage with this order already exists' });
    }

    const stage = new Stage({
      _id: `stage${order}`,
      title,
      description,
      order,
    });

    await stage.save();
    res.status(201).json({ message: 'Stage created successfully', stage });
  } catch (error) {
    console.error('Error creating stage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new subtest
exports.createSubtest = async (req, res) => {
  try {
    const { stageId, title, subcategories, unlockRequirement, cooldownDays } = req.body;

    if (!stageId || !title || !subcategories || subcategories.length === 0) {
      return res.status(400).json({ message: 'Stage ID, title, and subcategories are required' });
    }

    const stage = await Stage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    const subtest = new Subtest({
      _id: title.toLowerCase().replace(/\s+/g, '-'),
      stageId,
      title,
      subcategories,
      unlockRequirement: unlockRequirement || 70,
      cooldownDays: cooldownDays || 90,
      questions: [],
    });

    await subtest.save();
    res.status(201).json({ message: 'Subtest created successfully', subtest });
  } catch (error) {
    console.error('Error creating subtest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a question to a subtest
exports.addQuestion = async (req, res) => {
  try {
    const { subtestId, question, subcategory } = req.body;

    // Validate required fields
    if (!subtestId || !question || !subcategory) {
      return res.status(400).json({ message: 'subtestId, question, and subcategory are required' });
    }

    // Check if subtest exists
    const subtest = await Subtest.findById(subtestId);
    if (!subtest) {
      return res.status(404).json({ message: 'Subtest not found' });
    }

    // Check if subcategory is valid
    if (!subtest.subcategories.includes(subcategory)) {
      return res.status(400).json({ message: 'Subcategory not found in subtest' });
    }

    // Add question (options are set by schema default)
    subtest.questions.push({
      question,
      subcategory,
    });

    await subtest.save();
    res.status(201).json({ message: 'Question added successfully', subtest });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { subtestId, minScore, maxScore, comment } = req.body;

    if (!subtestId || minScore === undefined || maxScore === undefined || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const subtest = await Subtest.findById(subtestId);
    if (!subtest) {
      return res.status(404).json({ message: 'Subtest not found' });
    }

    const newComment = new Comment({
      subtestId,
      minScore,
      maxScore,
      comment,
    });

    await newComment.save();
    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.remove();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a stage
exports.deleteStage = async (req, res) => {
  try {
    const stage = await Stage.findById(req.params.stageId);
    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    const subtests = await Subtest.find({ stageId: req.params.stageId });
    if (subtests.length > 0) {
      return res.status(400).json({ message: 'Cannot delete stage with associated subtests' });
    }

    await stage.remove();
    res.status(200).json({ message: 'Stage deleted successfully' });
  } catch (error) {
    console.error('Error deleting stage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a subtest
exports.deleteSubtest = async (req, res) => {
  try {
    const subtest = await Subtest.findById(req.params.subtestId);
    if (!subtest) {
      return res.status(404).json({ message: 'Subtest not found' });
    }

    if (subtest.questions.length > 0) {
      return res.status(400).json({ message: 'Cannot delete subtest with associated questions' });
    }

    await subtest.remove();
    res.status(200).json({ message: 'Subtest deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtest:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};