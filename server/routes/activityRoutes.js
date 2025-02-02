const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Basic activity tracking
router.post('/log', activityController.logActivity);
router.get('/list', activityController.getActivities);
router.get('/summary', activityController.getActivitySummary);

// Social/Accountability features
router.get('/shared/:partnerId', activityController.getSharedActivities);
router.get('/feed', activityController.getActivityFeed);
router.post('/:activityId/comment', activityController.addComment);
router.post('/:activityId/react', activityController.addReaction);

module.exports = router;