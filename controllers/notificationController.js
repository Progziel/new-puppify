const { redisClient } = require('../config/redis');
const { sendPushNotification } = require('../config/firebase');
const logger = require('../utils/logger');

const storeFcmToken = async (userId, fcmToken) => {
  try {
    if (!userId || !fcmToken) {
      logger.warn(`Invalid FCM token data: userId=${userId}, fcmToken=${fcmToken}`);
      return { success: false, message: 'Invalid user ID or FCM token' };
    }

    await redisClient.hset('fcm_tokens', userId, fcmToken);
    logger.info(`Stored FCM token for user ${userId}`);
    return { success: true, message: 'FCM token stored successfully' };
  } catch (error) {
    logger.error(`Error storing FCM token for user ${userId}: ${error.message}`);
    return { success: false, message: 'Failed to store FCM token', error: error.message };
  }
};

const sendNotification = async (userId, payload) => {
  try {
    const fcmToken = await redisClient.hget('fcm_tokens', userId);
    if (!fcmToken) {
      logger.info(`No FCM token found for user ${userId}`);
      return { success: false, message: 'No FCM token found' };
    }

    await sendPushNotification(fcmToken, payload);
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    logger.error(`Error in sendNotification for user ${userId}: ${error.message}`);
    await redisClient.hdel('fcm_tokens', userId);
    return { success: false, message: 'Failed to send notification', error: error.message };
  }
};

const sendMessageNotification = async (receiverId, senderId, content, messageId) => {
  const payload = {
    title: `New Message from ${senderId}`,
    body: content,
    data: {
      messageId: messageId,
      senderId: senderId,
      type: 'chat_message'
    }
  };

  return await sendNotification(receiverId, payload);
};

module.exports = { storeFcmToken, sendMessageNotification };