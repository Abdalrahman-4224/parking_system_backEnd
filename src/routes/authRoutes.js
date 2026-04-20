const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator, validate } = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;
