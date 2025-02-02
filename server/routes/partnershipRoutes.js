const express = require('express');
const router = express.Router();
const workoutPartnershipController = require('../controllers/workoutPartnershipController');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePartnership } = require('../middleware/validationMiddleware');

router.use(authMiddleware);

// Create and manage partnerships
router.post('/create', validatePartnership, workoutPartnershipController.createPartnership);
router.get('/', workoutPartnershipController.getPartnerships);
router.get('/:partnerId', workoutPartnershipController.getPartnership);

// Goals and reminders
router.post('/:partnershipId/goals', workoutPartnershipController.addGoal);
router.put('/:partnershipId/goals/:goalId', workoutPartnershipController.updateGoal);
router.put('/:partnershipId/reminders', workoutPartnershipController.updateReminderPreferences);

// Partnership status
router.put('/:partnershipId/end', workoutPartnershipController.endPartnership);

module.exports = router;