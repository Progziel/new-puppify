const express = require('express');
const { getConversations,getMessagesById } = require('../controllers/messageController');

const { verifyToken } = require('../middlewares/verifyToken');
// const upload = require("../middlewares/fileUpload");

const router = express.Router();

/**
 * @swagger
 * /api/messages/:
 *   get:
 *     summary: Get user's conversations
 *     description: Retrieves a list of conversations for the authenticated user, including the other user's details, the last message, and unread message count.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   otherUser:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "user-sia-uuid"
 *                       full_name:
 *                         type: string
 *                         example: "Sia D"
 *                       profilePicture:
 *                         type: string
 *                         example: ""
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "msg-uuid-123"
 *                       content:
 *                         type: string
 *                         example: "Enter your message description here..."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T12:25:00.000Z"
 *                   unreadCount:
 *                     type: integer
 *                     example: 12
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getConversations);

/**
 * @swagger
 * /api/messages/{otherUserId}:
 *   get:
 *     summary: Get messages in a conversation
 *     description: Retrieves all messages between the authenticated user and the specified user, along with any meetings scheduled between them. Marks unread messages as read.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the other user in the conversation
 *         example: "user-jane-uuid"
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 otherUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "user-jane-uuid"
 *                     full_name:
 *                       type: string
 *                       example: "Jane"
 *                     profilePicture:
 *                       type: string
 *                       example: ""
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "msg-uuid-123"
 *                       senderId:
 *                         type: string
 *                         example: "user-jane-uuid"
 *                       receiverId:
 *                         type: string
 *                         example: "user-uuid-123"
 *                       content:
 *                         type: string
 *                         example: "Hey man!"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-25T11:25:00.000Z"
 *                       isRead:
 *                         type: boolean
 *                         example: true
 *                 meetings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer // Changed from string to integer
 *                         example: 1
 *                       product:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Service name"
 *                           imageUrl:
 *                             type: string
 *                             example: "/uploads/service-image.png"
 *                       price:
 *                         type: integer
 *                         example: 45
 *                       dateTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-23T12:30:00.000Z"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *       404:
 *         description: Other user not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:otherUserId', verifyToken, getMessagesById);





module.exports = router;