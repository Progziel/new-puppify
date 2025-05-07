const express = require('express');
const { 
    toggleProductFavorite,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct

} = require('../controllers/productController');

const { verifyToken } = require('../middlewares/verifyToken');
const upload = require("../middlewares/fileUpload");

const router = express.Router();
/**
 * @swagger
 * /api/products/{productId}/favorite:
 *   post:
 *     summary: Toggle favorite on a product
 *     description: Allows the authenticated user to add or remove a product from their favorites. If the product is already favorited, this will remove it, and vice versa.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to favorite or unfavorite
 *     responses:
 *       200:
 *         description: Favorite toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 favorited:
 *                   type: boolean
 *                   description: Whether the product is now favorited by the user
 *             examples:
 *               favorited:
 *                 value:
 *                   message: "Product added to favorites"
 *                   favorited: true
 *               unfavorited:
 *                 value:
 *                   message: "Product removed from favorites"
 *                   favorited: false
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authentication required"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to toggle favorite"
 */
router.post('/:productId/favorite', toggleProductFavorite);

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get product details by ID
 *     description: Retrieves detailed information about a specific product, including its category, multiple images, multiple videos, favorite count, and whether the authenticated user has favorited it. Accessible to both authenticated and unauthenticated users. Price and rating are 0.0 by default if not specified.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *             example:
 *               id: 1
 *               name: "Golden Retriever Puppy"
 *               price: 500
 *               imageUrls:
 *                 - "/uploads/image-123456789.jpg"
 *                 - "/uploads/image-987654321.jpg"
 *               videoUrls:
 *                 - "/uploads/video-456789123.mp4"
 *               rating: 4.5
 *               shortDescription: "A friendly Golden Retriever puppy"
 *               longDescription: "This Golden Retriever puppy is 8 weeks old, vaccinated, and ready for a loving home."
 *               breed: "Golden Retriever"
 *               gender: "Male"
 *               age: 2
 *               healthStatus: "Healthy"
 *               createdAt: "2025-04-29T12:00:00Z"
 *               category:
 *                 id: "abc123"
 *                 name: "Puppies"
 *                 module: "DOGS"
 *               favoriteCount: 10
 *               isFavorited: true
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid product ID"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch product"
 */
router.get('/:productId', getProductById);
/**
 * @swagger
 * /api/products/:
 *   post:
 *     summary: Create a new product
 *     description: Allows an authenticated user to create a new product with multiple images and videos.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - product_name
 *               - categoryId
 *             properties:
 *               product_name:
 *                 type: string
 *                 example: "Golden Retriever Puppy"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 250.0
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               shortDescription:
 *                 type: string
 *                 example: "Cute and healthy puppy available"
 *               breed:
 *                 type: string
 *                 example: "Golden Retriever"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 example: "Male"
 *               age:
 *                 type: integer
 *                 example: 6
 *               healthStatus:
 *                 type: string
 *                 example: "Vaccinated and dewormed"
 *               longDescription:
 *                 type: string
 *                 example: "Playful, affectionate, and great with kids. Available for adoption."
 *               categoryId:
 *                 type: string
 *                 example: "abc123"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique product identifier
 *                     product_name:
 *                       type: string
 *                       description: Name of the product
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Price of the product
 *             examples:
 *               success:
 *                 value:
 *                   message: "Product created successfully"
 *                   product:
 *                     id: "abc123"
 *                     product_name: "Golden Retriever Puppy"
 *                     price: 250.0
 *       400:
 *         description: Bad request or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/',verifyToken,
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'videos', maxCount: 5 },
    ]),
    createProduct
  );

/**
 * @swagger
 * /api/products/{productId}:
 *   patch:
 *     summary: Update a product
 *     description: Allows authenticated sellers or admins to update a product's details, add new images/videos, or remove existing ones. Files are stored on the server, and their URLs are saved in the database. Removed media files are deleted from the server.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 description: Name of the product
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               categoryId:
 *                 type: string
 *                 description: ID of the category the product belongs to
 *               shortDescription:
 *                 type: string
 *                 description: Short description of the product
 *               longDescription:
 *                 type: string
 *                 description: Detailed description of the product
 *               breed:
 *                 type: string
 *                 description: Breed of the product (e.g., for dogs)
 *               gender:
 *                 type: string
 *                 description: Gender of the product (e.g., for dogs)
 *               age:
 *                 type: integer
 *                 description: Age of the product (e.g., in months for dogs)
 *               healthStatus:
 *                 type: string
 *                 description: Health status of the product (e.g., for dogs)
 *               rating:
 *                 type: number
 *                 description: Rating of the product (0 to 5)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New image files to upload (e.g., .jpg, .png, max 10 files)
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New video files to upload (e.g., .mp4, .mov, max 5 files)
 *               removeImages:
 *                 type: string
 *                 description: JSON array of image URLs to remove (e.g., '["/uploads/image1.jpg"]')
 *               removeVideos:
 *                 type: string
 *                 description: JSON array of video URLs to remove (e.g., '["/uploads/video1.mp4"]')
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *             example:
 *               message: "Product updated successfully"
 *               product:
 *                 id: 1
 *                 product_name: "Updated Golden Retriever Puppy"
 *                 price: 600
 *                 rating: 4.8
 *                 shortDescription: "An energetic Golden Retriever puppy"
 *                 longDescription: "This Golden Retriever puppy is 10 weeks old, fully vaccinated."
 *                 breed: "Golden Retriever"
 *                 gender: "Female"
 *                 age: 2
 *                 healthStatus: "Healthy"
 *                 categoryId: "abc123"
 *                 images:
 *                   - "/uploads/image-123456789.jpg"
 *                   - "/uploads/new-image-987654321.jpg"
 *                 videos:
 *                   - "/uploads/new-video-456789123.mp4"
 *       400:
 *         description: Invalid input (e.g., invalid product ID, price, or JSON format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid product ID"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authentication required"
 *       403:
 *         description: Forbidden (user is not a seller or admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Only sellers or admins can update products"
 *       404:
 *         description: Product or category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Product not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to update product"
 */
router.patch(
    '/:productId',
    // verifyToken,
    upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'videos', maxCount: 5 },
    ]),
    updateProduct
  );
  
  /**
   * @swagger
   * /api/products/{productId}:
   *   delete:
   *     summary: Delete a product
   *     description: Allows authenticated sellers or admins to delete a product and its associated images and videos. Associated files are removed from the server.
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *         description: The ID of the product to delete
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Success message
   *             example:
   *               message: "Product deleted successfully"
   *       400:
   *         description: Invalid product ID
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Invalid product ID"
   *       401:
   *         description: Authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Authentication required"
   *       403:
   *         description: Forbidden (user is not a seller or admin)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Only sellers or admins can delete products"
   *       404:
   *         description: Product not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Product not found"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *             example:
   *               error: "Failed to delete product"
   */
  router.delete('/:productId', verifyToken, deleteProduct);


module.exports = router;