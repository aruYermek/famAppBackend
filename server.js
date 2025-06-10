const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const logger = require('./logger');
const { validateGoogleToken } = require('./controllers/googleAuthController');


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  logger.debug('Incoming Request:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers,
  });
  next();
});


app.use('/auth', require('./routes/authRoutes')); 
app.use('/api', require('./routes/userRoutes')); 
app.use('/api', require('./routes/profileRoutes'));
app.use('/api/tests', require('./routes/testRoutes')); 
app.use('/api/results', require('./routes/resultsRoutes')); 
app.use('/api/insights', require('./routes/insightRoutes')); 
app.use('/api', require('./routes/progressRoutes'));
app.use('/api', require('./routes/questionnaireRoutes')); 
app.use('/api/admin', require('./routes/adminRoutes')); 
app.post('/auth/google/validate', validateGoogleToken);
app.use('/api/stages', require('./routes/stageRoutes'));
app.use('/api/external', require('./routes/externalRoutes'));


const startServer = async () => {
  try {
    
    await connectDB();
    console.log('✅ MongoDB Connected');

   
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