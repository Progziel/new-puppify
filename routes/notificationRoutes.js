const express = require('express');
const router = express.Router();
const { storeFcmToken, sendMessageNotification } = require('../controllers/notificationController');

// Route to store FCM token
router.post('/store-fcm-token', storeFcmToken);

// Test route to send a message notification
router.post('/send-message', sendMessageNotification);

module.exports = router;