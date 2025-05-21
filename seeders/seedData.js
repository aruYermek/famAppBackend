const mongoose = require('mongoose');
const Stage = require('../models/Stage');
const Subtest = require('../models/Subtest');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const stages = [
  {
    _id: 'seed-stage1',
    title: 'Test Stage 1',
    description: 'A test stage for development',
    order: 1,
  },
];

const subtests = [
  {
    _id: 'seed-emotional-maturity',
    stageId: 'seed-stage1',
    title: 'Test Emotional Maturity',
    subcategories: ['Emotional Awareness', 'Empathy'],
    unlockRequirement: 70,
    cooldownDays: 90,
    questions: [
      {
        question: 'How do you handle stress? (Test)',
        options: ['Calmly', 'With panic', 'Avoid it', 'Seek help'],
        correctAnswer: 'A',
        subcategory: 'Emotional Awareness',
      },
    ],
  },
];

const adminUser = {
  name: 'Test Admin',
  phone: '+71234567890',
  email: 'test-admin@example.com',
  password: 'TestPass1!',
  role: 'admin',
  emailVerified: true,
};

const seedData = async () => {
  let isSeeded = false;

  // Skip seeding in non-development environments
  if (process.env.NODE_ENV !== 'development') {
    console.log('Seeding is only allowed in development environment');
    return isSeeded;
  }

  // Check if seeding is necessary
  const existingAdmin = await User.findOne({ role: 'admin' });
  const existingStages = await Stage.countDocuments();
  if (existingAdmin && existingStages > 0) {
    console.log('Database already contains an admin user and stages, skipping seeding...');
    return isSeeded;
  }

  // Seed or update admin user
  let user = await User.findOne({ $or: [{ email: adminUser.email }, { phone: adminUser.phone }] });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    user = await User.create({
      ...adminUser,
      password: hashedPassword,
    });
    isSeeded = true;
    console.log(`Seeded new admin user: ${adminUser.email}`);
  } else if (user.role !== 'admin') {
    user.role = 'admin';
    user.emailVerified = true;
    await user.save();
    isSeeded = true;
    console.log(`Updated existing user to admin: ${adminUser.email}`);
  } else {
    console.log(`Admin user ${adminUser.email} already exists, skipping...`);
  }

  // Seed stages
  for (const stage of stages) {
    const existingStage = await Stage.findOne({ _id: stage._id });
    if (!existingStage) {
      await Stage.create(stage);
      isSeeded = true;
      console.log(`Seeded stage: ${stage.title}`);
    } else {
      console.log(`Stage ${stage.title} already exists, skipping...`);
    }
  }

  // Seed subtests
  for (const subtest of subtests) {
    const existingSubtest = await Subtest.findOne({ _id: subtest._id });
    if (!existingSubtest) {
      await Subtest.create(subtest);
      isSeeded = true;
      console.log(`Seeded subtest: ${subtest.title}`);
    } else {
      console.log(`Subtest ${subtest.title} already exists, skipping...`);
    }
  }

  return isSeeded;
};

module.exports = seedData;