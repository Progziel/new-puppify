const express = require('express');
const { connectionRequest,acceptRequest,rejectRequest,cancelRequest,getPendingConnection,getConnectedAccount,removeConnectedAccount  } = require('../controllers/connectionController');

const { verifyToken } = require('../middlewares/verifyToken');
// const upload = require("../middlewares/fileUpload");

const router = express.Router();

/**
 * @swagger
 * /api/connection/connection-requests:
 *   post:
 *     summary: Send a connection request
 *     description: Allows the authenticated user to send a connection request to another user.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: The ID of the user to connect with
 *                 example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       201:
 *         description: Connection request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request sent
 *                 request:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     senderId:
 *                       type: string
 *                     receiverId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: PENDING
 *       400:
 *         description: Bad request (e.g., cannot connect with self, already connected, or request already exists)
 *       401:
 *         description: Unauthorized (invalid or missing JWT)
 *       500:
 *         description: Server error
 */
router.post('/connection-requests',verifyToken,connectionRequest);

/**
 * @swagger
* /api/connection/connection-requests/{id}/accept:
 *   post:
 *     summary: Accept a connection request
 *     description: Allows the authenticated user to accept a connection request, creating a ConnectedAccount record and deleting the request.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the connection request
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Connection request accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request accepted
 *       400:
 *         description: Bad request (e.g., request not pending)
 *       403:
 *         description: Forbidden (not the receiver)
 *       404:
 *         description: Connection request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/connection-requests/:id/accept',verifyToken,acceptRequest);


/**
 * @swagger
 * /api/connection/connection-requests/{id}/reject:
 *   post:
 *     summary: Reject a connection request
 *     description: Allows the authenticated user to reject a connection request.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the connection request
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Connection request rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request rejected
 *       400:
 *         description: Bad request (e.g., request not pending)
 *       403:
 *         description: Forbidden (not the receiver)
 *       404:
 *         description: Connection request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/connection-requests/:id/reject',verifyToken,rejectRequest);

/**
 * @swagger
 * /api/connection/cancel-request/{id}:
 *   delete:
 *     summary: Cancel a sent connection request
 *     description: Allows the authenticated user to cancel a pending connection request they sent.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the connection request
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Connection request canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connection request canceled
 *       400:
 *         description: Bad request (e.g., request not pending)
 *       403:
 *         description: Forbidden (not the sender)
 *       404:
 *         description: Connection request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/cancel-request/:id',verifyToken,cancelRequest);

/**
 * @swagger
 * /api/connection/pending-connection:
 *   get:
 *     summary: Get pending connection requests
 *     description: Retrieves the list of pending connection requests (sent and received) for the authenticated user, including user details like full name and profile picture.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending connection requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sent:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       receiver:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                             example: Jane Smith
 *                           profilePicture:
 *                             type: string
 *                             example: /Uploads/profile-pic.png
 *                 received:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 550e8400-e29b-41d4-a716-446655440001
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           full_name:
 *                             type: string
 *                             example: John Doe
 *                           profilePicture:
 *                             type: string
 *                             example: /Uploads/profile-pic.png
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/pending-connection',verifyToken,getPendingConnection);

/**
 * @swagger
 * /api/connection/connected-accounts:
 *   get:
 *     summary: Get connected accounts
 *     description: Retrieves the list of users connected to the authenticated user, including their full name and profile picture, along with the total connection count.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected users and connection count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 123e4567-e89b-12d3-a456-426614174001
 *                       full_name:
 *                         type: string
 *                         example: Jane Smith
 *                       profilePicture:
 *                         type: string
 *                         example: /Uploads/profile-pic.png
 *                 connectionCount:
 *                   type: integer
 *                   example: 15000
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/connected-accounts', verifyToken, getConnectedAccount);


/**
 * @swagger
 * /api/connection/connected-accounts/{userId}:
 *   delete:
 *     summary: Remove a connected account
 *     description: Allows the authenticated user to disconnect from another user by deleting the ConnectedAccount record.
 *     tags: [Connections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the user to disconnect from
 *         example: 123e4567-e89b-12d3-a456-426614174001
 *     responses:
 *       200:
 *         description: Connected account removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Connected account removed
 *       400:
 *         description: Bad request (e.g., cannot disconnect from yourself)
 *       404:
 *         description: Connected account not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/connected-accounts/:userId', verifyToken, removeConnectedAccount);

module.exports = router;