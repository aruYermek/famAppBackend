const express = require('express');
const externalRouter = express.Router();
const { getNewsByTopic } = require('../controllers/externalNewsController');

externalRouter.get('/news/:topic', getNewsByTopic);

module.exports = externalRouter;
