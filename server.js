const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route Imports
app.use('/auth', require('./routes/authRoutes')); // Authentication routes
app.use('/api', require('./routes/userRoutes')); // User data
app.use('/api', require('./routes/profileRoutes'));
app.use('/api/tests', require('./routes/testRoutes')); // Test-related routes
app.use('/api/results', require('./routes/resultsRoutes')); // Test results
app.use('/api/insights', require('./routes/insightRoutes')); // Insights
app.use('/api', require('./routes/progressRoutes')); // Progress
app.use('/api', require('./routes/questionnaireRoutes')); // Questionnaire
app.use('/api/admin', require('./routes/adminRoutes')); // Admin routes

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB Connected');

    // Start Server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();