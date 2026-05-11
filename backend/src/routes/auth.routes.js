const router = require('express').Router();
const authController = require('../controllers/auth.controller');

//user registration and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);

//Admin login route (no registration for admins, they are seeded in the database)
router.post('/admin/login', authController.adminLogin);

module.exports = router;