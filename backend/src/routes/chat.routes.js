const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { requireUser } = require('../middleware/role.middleware');
const chatController = require('../controllers/chat.controller');

router.get('/my-messages', auth, requireUser, chatController.getMyMessages);
router.post('/send', auth, requireUser, chatController.sendMessage);

module.exports = router;