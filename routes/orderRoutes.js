const express = require('express');
const { getOrders,getOrderById,cancelOrder } = require('../controllers/orderController');

const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

/**
 * @swagger
 * /api/order/:
 *   get:
 *     summary: Get product details for all orders of the authenticated user
 *     description: Retrieves a list of product details (name, image URL, price, rating, and description) for all orders of the authenticated user. Supports searching by product name.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search orders by product name (case-insensitive)
 *         example: Dog clothes
 *     responses:
 *       200:
 *         description: List of product details for orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Dog clothes name"
 *                   imageUrl:
 *                     type: string
 *                     example: "/uploads/dog-clothes.png"
 *                   price:
 *                     type: number
 *                     example: 200
 *                   rating:
 *                     type: number
 *                     example: 4.5
 *                   description:
 *                     type: string
 *                     example: "Short description should be written here about services short description should be written here"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken,getOrders);

/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: Get an order by ID
 *     description: Retrieves details of a specific order for the authenticated user, including specific product details (name, image URL, price, rating, and description).
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Order details with specific fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 userId:
 *                   type: string
 *                   example: "user-uuid-123"
 *                 productId:
 *                   type: integer
 *                   example: 1
 *                 quantity:
 *                   type: integer
 *                   example: 1
 *                 totalPrice:
 *                   type: number
 *                   example: 200
 *                 orderNumber:
 *                   type: string
 *                   example: "46578295"
 *                 deliveryMethod:
 *                   type: string
 *                   example: "CARD"
 *                 deliveryAddress:
 *                   type: object
 *                   example: { "name": "Jonathan Doe", "street": "144 Baker Avenue", "city": "Northenhills, UK", "postalCode": "SW43 4MM" }
 *                 estimatedArrival:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-04-05T00:00:00.000Z"
 *                 billingDetails:
 *                   type: object
 *                   example: { "sameAsDelivery": true }
 *                 paymentMethod:
 *                   type: string
 *                   example: "Debit card ending in 1234"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-04-03T00:00:00.000Z"
 *                 product:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Dog clothes name"
 *                     imageUrl:
 *                       type: string
 *                       example: "/uploads/dog-clothes.png"
 *                     price:
 *                       type: number
 *                       example: 200
 *                     rating:
 *                       type: number
 *                       example: 4.5
 *                     description:
 *                       type: string
 *                       example: "Short description should be written here about services short description should be written here"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (order does not belong to user)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getOrderById);

/**
 * @swagger
 * /api/order/{id}/cancel:
 *   put:
 *     summary: Cancel an order by ID (soft deletion)
 *     description: Marks a specific order as canceled for the authenticated user by updating its status to CANCELED.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to cancel
 *         example: 1
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order canceled successfully"
 *       400:
 *         description: Bad request (e.g., order already canceled)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (order does not belong to user)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/cancel', verifyToken, cancelOrder);



module.exports = router;