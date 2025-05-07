const express = require('express');
const { getAppointments } = require('../controllers/appointmentController');

const { verifyToken } = require('../middlewares/verifyToken');
// const upload = require("../middlewares/fileUpload");

const router = express.Router();

/**
 * @swagger
 * /api/appointment/:
 *   get:
 *     summary: Get appointments
 *     description: Retrieves a list of appointments for the authenticated user, filtered by status (all, today, upcoming, completed). Includes service name, service image, person name, date/time, and status.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, today, upcoming, completed]
 *         description: Filter appointments by status
 *         example: today
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Appointment ID
 *                     example: 1
 *                   serviceName:
 *                     type: string
 *                     description: Name of the service
 *                     example: Puppy Training Session
 *                   serviceImageUrl:
 *                     type: string
 *                     description: URL of the service image
 *                     example: /Uploads/service-123.png
 *                   personName:
 *                     type: string
 *                     description: Full name of the person
 *                     example: John Doe
 *                   dateTime:
 *                     type: string
 *                     format: date-time
 *                     description: Appointment date and time
 *                     example: 2025-03-24T12:00:00.000Z
 *                   status:
 *                     type: string
 *                     description: Appointment status
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
 *                   example: Error fetching appointments
 */
router.get('/', getAppointments);



module.exports = router;