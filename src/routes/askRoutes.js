const express = require('express');
const { askQuestion, askHistory } = require('../controllers/askController');
const authMiddleware = require('../middleware/authMiddleware');
const askRateLimitMiddleware = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/', authMiddleware, askRateLimitMiddleware, askQuestion);
router.get('/history', authMiddleware, askHistory);

module.exports = router;
