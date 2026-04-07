const express = require('express');
const { askQuestion } = require('../controllers/askController');
const authMiddleware = require('../middleware/authMiddleware');
const askRateLimitMiddleware = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/', authMiddleware, askRateLimitMiddleware, askQuestion);

module.exports = router;
