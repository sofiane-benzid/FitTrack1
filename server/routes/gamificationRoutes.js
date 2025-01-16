const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/points', gamificationController.getPoints);
router.get('/streak', gamificationController.getStreak);
router.get('/achievements', gamificationController.getAchievements);
router.get('/leaderboard', gamificationController.getLeaderboard);
router.get('/badges', authMiddleware, gamificationController.getBadges);

module.exports = router;