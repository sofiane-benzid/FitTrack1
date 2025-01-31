const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create', chatController.createChat);
router.get('/', chatController.getChats);
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.put('/:chatId/read', chatController.markMessagesAsRead);

module.exports = router;

