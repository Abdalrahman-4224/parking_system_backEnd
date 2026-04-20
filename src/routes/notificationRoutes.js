const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);

module.exports = router;
