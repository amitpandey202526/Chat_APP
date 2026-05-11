const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { requireUser } = require('../middleware/role.middleware');
const chatController = require('../controllers/chat.controller');

// User routes for fetching own messages and sending messages to admin

router.get('/my-messages/:id', auth, requireUser, chatController.getMyMessages);
router.post('/send', auth, chatController.sendMessage);

module.exports = router;