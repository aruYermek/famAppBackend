const User = require('../models/User');

exports.submitStep1 = async (req, res) => {
  try {
    const { age, gender } = req.body;
    const user = await User.findById(req.user._id); 
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.age = age;
    user.gender = gender;
    await user.save();
    res.json({ message: 'Step 1 completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.submitStep2 = async (req, res) => {
  try {
    const { relationshipStatus, hasChildren, numberOfChildren } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.relationshipStatus = relationshipStatus;
    user.hasChildren = hasChildren;
    user.numberOfChildren = hasChildren ? numberOfChildren : undefined; // Clear if no children
    await user.save();
    res.json({ message: 'Step 2 completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};