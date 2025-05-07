const express = require('express');
const { createStorefront, getStorefrontById } = require('../controllers/storefrontController');
const router = express.Router();
const upload = require("../middlewares/fileUpload");

/**
 * @swagger
 * /api/storefront/:
 *   post:
 *     summary: Create a new storefront
 *     description: Creates a new storefront with associated images and videos, linked to a category. Supports uploading images (max 10) and videos (max 5) as files.
 *     tags: [Storefront]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the storefront
 *               storeType:
 *                 type: string
 *                 enum: [DOGS, SERVICES, APPAREL]
 *                 description: Type of store (matches module)
 *               subcategory:
 *                 type: string
 *                 description: Subcategory of the store
 *               categoryId:
 *                 type: string
 *                 description: ID of the category to link the storefront to
 *               shortDescription:
 *                 type: string
 *                 description: Short description of the store
 *               longDescription:
 *                 type: string
 *                 description: Detailed description of the store
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *               email:
 *                 type: string
 *                 description: Contact email
 *               operatingHours:
 *                 type: string
 *                 description: Operating hours in string format
 *               location:
 *                 type: string
 *                 description: Location details in JSON string format
 *               template_index:
 *                 type: integer
 *                 description: Index of the template image to use
 *               templateImageAltText:
 *                 type: string
 *                 description: Optional alt text for the template image
 *               templateImage:
 *                 type: string
 *                 format: binary
 *                 description: A single image file to use as the storefront's template image (e.g., JPEG, PNG). Optional.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files (max 10)
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of video files (max 5)
 *             required:
 *               - title
 *               - storeType
 *               - subcategory
 *               - categoryId
 *               - shortDescription
 *               - longDescription
 *               - phone
 *               - email
 *     responses:
 *       201:
 *         description: Storefront created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the created storefront
 *                 title:
 *                   type: string
 *                   description: The title of the storefront
 *                 imageUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the uploaded images
 *                 videoUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the uploaded videos
 *                 templateImage:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the template image
 *                     altText:
 *                       type: string
 *                       description: Alt text for the template image
 *                   description: Details of the template image, or null if not provided
 *                 storeType:
 *                   type: string
 *                   description: The type of store
 *                 subcategory:
 *                   type: string
 *                   description: The subcategory of the storefront
 *                 categoryId:
 *                   type: string
 *                   description: The ID of the associated category
 *                 shortDescription:
 *                   type: string
 *                   description: A brief description
 *                 longDescription:
 *                   type: string
 *                   description: A detailed description
 *                 phone:
 *                   type: string
 *                   description: The contact phone number
 *                 email:
 *                   type: string
 *                   description: The contact email address
 *                 operatingHours:
 *                   type: string
 *                   description: Operating hours
 *                 location:
 *                   type: object
 *                   description: Location data
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last updated timestamp
 *                 template_index:
 *                   type: integer
 *                   description: Template index
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post('/', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'templateImage', maxCount: 1 },
  ]), createStorefront);

  /**
 * @swagger
 * /api/storefront/{id}:
 *   get:
 *     summary: Get a storefront by ID
 *     description: Retrieves the details of a storefront by its ID, including associated images, videos, and template image.
 *     tags: [Storefront]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the storefront to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved storefront
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the storefront
 *                 title:
 *                   type: string
 *                   description: The title of the storefront
 *                 imageUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the uploaded images
 *                 videoUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: URLs of the uploaded videos
 *                 templateImage:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the template image
 *                     altText:
 *                       type: string
 *                       description: Alt text for the template image
 *                   description: Details of the template image, or null if not provided
 *                 storeType:
 *                   type: string
 *                   description: The type of store
 *                 subcategory:
 *                   type: string
 *                   description: The subcategory of the storefront
 *                 categoryId:
 *                   type: string
 *                   description: The ID of the associated category
 *                 shortDescription:
 *                   type: string
 *                   description: A brief description
 *                 longDescription:
 *                   type: string
 *                   description: A detailed description
 *                 phone:
 *                   type: string
 *                   description: The contact phone number
 *                 email:
 *                   type: string
 *                   description: The contact email address
 *                 operatingHours:
 *                   type: object
 *                   description: Operating hours
 *                 location:
 *                   type: object
 *                   description: Location data
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last updated timestamp
 *                 template_index:
 *                   type: integer
 *                   description: Template index
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               title: "The Pet Shop"
 *               imageUrls:
 *                 - "/uploads/images-1746526122514-644378929.jpg"
 *                 - "/uploads/images-1746526122623-385414861.jpg"
 *               videoUrls: []
 *               templateImage:
 *                 url: "/uploads/templateImage-1746526122406-911573052.jpg"
 *                 altText: "abcd"
 *               storeType: "DOGS"
 *               subcategory: "BEAGLE"
 *               categoryId: "07c1c5d3-5d82-4f4e-82a6-a780ff662538"
 *               shortDescription: "SHORT"
 *               longDescription: "LONG"
 *               phone: "545457"
 *               email: "a@gmail.com"
 *               operatingHours:
 *                 monday: "9am-5pm"
 *               location:
 *                 lat: 40.7128
 *                 lng: -74.006
 *               createdAt: "2025-05-06T15:08:42Z"
 *               updatedAt: "2025-05-06T15:08:42Z"
 *               template_index: 1
 *       404:
 *         description: Storefront not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *             example:
 *               error: "Storefront not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *             example:
 *               error: "Failed to fetch storefront"
 */
router.get('/:id', getStorefrontById);


module.exports = router;