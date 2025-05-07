const express = require('express');
const { createAdvertisement,updateAdvertisement,deleteAdvertisement, getAdvertisements } = require('../controllers/advertisementController');

const { verifyToken } = require('../middlewares/verifyToken');
const upload = require("../middlewares/fileUpload");

const router = express.Router();

 /**
 * @swagger
 * /api/advertisement/:
 *   post:
 *     summary: Create a new advertisement
 *     description: Allows an authenticated user to create a new advertisement with an uploaded image.
 *     tags: [Advertisements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Summer Sale
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The advertisement image file to upload
 *               redirectTo:
 *                 type: string
 *                 example: storefront-123
 *                 description: The ID or URL to redirect to (e.g., storefrontId, announcementId, buyer/sellerId, or otherLink)
 *               redirectType:
 *                 type: string
 *                 enum: [Storefront, Announcement, Buyer, Seller, OtherLink]
 *                 example: Storefront
 *                 description: The type of redirect target
 *               slogan:
 *                 type: string
 *                 example: "Big Discounts Await!"
 *               description:
 *                 type: string
 *                 example: "Check out our summer sale with up to 50% off."
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: Whether the advertisement is active (defaults to true)
 *               advertisementType:
 *                 type: string
 *                 enum: [Banner, Announcement, Dog, Service, Apparel]
 *                 example: Banner
 *                 description: The type of advertisement
 *               template_index:
 *                 type: integer
 *                 example: 1
 *                 description: The template index for the advertisement (defaults to 0)
 *     responses:
 *       201:
 *         description: Advertisement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Advertisement created
 *                 advertisement:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     redirectTo:
 *                       type: string
 *                     redirectType:
 *                       type: string
 *                       enum: [Storefront, Announcement, Buyer, Seller, OtherLink]
 *                     slogan:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     advertisementType:
 *                       type: string
 *                       enum: [Banner, Announcement, Dog, Service, Apparel]
 *                     template_index:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (e.g., missing required fields or file)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('image'),createAdvertisement);

/**
 * @swagger
 * /api/advertisement/:
 *   get:
 *     summary: Get all advertisements in random order
 *     description: Retrieves a list of advertisements in random order. By default, only active advertisements are returned unless the 'all' query parameter is set to true. Optionally filter by advertisementType.
 *     tags: [Advertisements]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: If true, fetches all advertisements (active and inactive); otherwise, fetches only active advertisements
 *         example: false
 *       - in: query
 *         name: advertisementType
 *         schema:
 *           type: string
 *           enum: [Banner, Announcement, Dog, Service, Apparel]
 *         description: Filter advertisements by advertisementType
 *         example: Banner
 *     responses:
 *       200:
 *         description: List of advertisements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                   redirectTo:
 *                     type: string
 *                   redirectType:
 *                     type: string
 *                     enum: [Storefront, Announcement, Buyer, Seller, OtherLink]
 *                   slogan:
 *                     type: string
 *                   description:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   advertisementType:
 *                     type: string
 *                     enum: [Banner, Announcement, Dog, Service, Apparel]
 *                   template_index:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', getAdvertisements);

/**
 * @swagger
 * /api/advertisement/{id}:
 *   put:
 *     summary: Update an advertisement's active status
 *     description: Allows an authenticated user to update the isActive status of an existing advertisement.
 *     tags: [Advertisements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the advertisement to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *                 description: Whether the advertisement is active
 *     responses:
 *       200:
 *         description: Advertisement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Advertisement updated
 *                 advertisement:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                     redirectTo:
 *                       type: string
 *                     redirectType:
 *                       type: string
 *                       enum: [Storefront, Announcement, Buyer, Seller, OtherLink]
 *                     slogan:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     advertisementType:
 *                       type: string
 *                       enum: [Banner, Dog, Service, Apparel]
 *                     template_index:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (e.g., missing isActive field)
 *       404:
 *         description: Banner not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', updateAdvertisement);

/**
 * @swagger
 * /api/advertisement/{id}:
 *   delete:
 *     summary: Delete an advertisement
 *     description: Allows an authenticated user to delete an advertisement.
 *     tags: [Advertisements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the advertisement to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Advertisement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Advertisement deleted
 *       404:
 *         description: Advertisement not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteAdvertisement);

module.exports = router;