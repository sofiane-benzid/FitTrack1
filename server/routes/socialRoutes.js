const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Friend routes
router.get('/friends', socialController.getFriends);
router.post('/friends/request', socialController.sendFriendRequest);
router.get('/friends/requests', socialController.getFriendRequests);
router.post('/friends/respond/:friendshipId', socialController.respondToFriendRequest);
router.delete('/friends/request/:requestId', socialController.cancelFriendRequest);
router.delete('/friends/:friendId', socialController.removeFriend);

// User search route
router.get('/users/search', socialController.searchUsers);

// Challenge routes
router.post('/challenges', socialController.createChallenge);
router.get('/challenges', socialController.getChallenges);

// Notification routes
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:notificationId/read', notificationController.markNotificationAsRead);
router.put('/notifications/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

module.exports = router;