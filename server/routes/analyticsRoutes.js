const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get user analytics
router.get('/', analyticsController.getUserAnalytics);

module.exports = router;