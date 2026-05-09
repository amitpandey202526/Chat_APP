const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const adminController = require('../controllers/admin.controller');

router.get('/conversations', auth, requireAdmin, adminController.getConversations);
router.get('/conversations/:userId', auth, requireAdmin, adminController.getConversation);
router.post('/conversations/:userId/reply', auth, requireAdmin, adminController.reply);
router.patch('/conversations/:userId/read', auth, requireAdmin, adminController.markAsRead);

module.exports = router;