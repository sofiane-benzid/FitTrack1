const express = require('express');
const router = express.Router();
const workoutPartnershipController = require('../controllers/workoutPartnershipController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create', workoutPartnershipController.createPartnership);
router.get('/', workoutPartnershipController.getPartnerships);
router.put('/:partnershipId/goals', workoutPartnershipController.updatePartnershipGoals);
router.put('/:partnershipId/reminders', workoutPartnershipController.updateReminderPreferences);
router.put('/:partnershipId/end', workoutPartnershipController.endPartnership);

module.exports = router;