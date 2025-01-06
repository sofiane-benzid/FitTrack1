const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/log', activityController.logActivity);
router.get('/list', activityController.getActivities);
router.get('/summary', activityController.getActivitySummary);

module.exports = router;