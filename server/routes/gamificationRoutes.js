const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Points routes
router.post('/points', gamificationController.awardPoints);
router.get('/points', gamificationController.getPoints);

// Badge routes
router.post('/badges', gamificationController.awardBadge);
router.get('/badges', gamificationController.getBadges);

// Leaderboard route
router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;