const express = require('express');
const { getMeetings } = require('../controllers/meetingController');

const { verifyToken } = require('../middlewares/verifyToken');
// const upload = require("../middlewares/fileUpload");

const router = express.Router();

/**
 * @swagger
 * /api/meeting/:
 *   get:
 *     summary: Get meetings
 *     description: Retrieves a list of meetings for the authenticated user, filtered by status.
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, today, upcoming, completed]
 *         description: Filter meetings by status
 *         example: today
 *     responses:
 *       200:
 *         description: List of meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Meeting ID
 *                     example: 1
 *                   productName:
 *                     type: string
 *                     description: Name of the product
 *                     example: Puppy Training Session
 *                   productImageUrl:
 *                     type: string
 *                     description: URL of the product image
 *                     example: /Uploads/product-123.png
 *                   personName:
 *                     type: string
 *                     description: Full name of the person
 *                     example: John Doe
 *                   dateTime:
 *                     type: string
 *                     format: date-time
 *                     description: Meeting date and time
 *                     example: 2025-04-18T12:00:00.000Z
 *                   status:
 *                     type: string
 *                     description: Meeting status
 *                     example: Today
 *       401:
 *         description: Unauthorized (invalid or missing JWT)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching meetings
 */
router.get('/', getMeetings);



module.exports = router;