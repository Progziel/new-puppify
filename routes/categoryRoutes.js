const express = require('express');
const { createCategory, getCategoryByModule, getSubCategoriesByModule } = require('../controllers/categoryController');
const upload = require('../middlewares/fileUpload'); 
const router = express.Router();


/**
 * @swagger
 * /api/category/:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category with the specified module, category name, and an optional image file. The module must be one of DOGS, SERVICES, or APPAREL. The image must be uploaded as a file with the field name 'image'.
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               module:
 *                 type: string
 *                 description: The module for the category (e.g., DOGS, SERVICES, APPAREL)
 *                 enum: [DOGS, SERVICES, APPAREL]
 *               category_name:
 *                 type: string
 *                 description: The name of the category
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the category (optional, must be JPEG, PNG, or GIF, max 5MB)
 *             required:
 *               - module
 *               - category_name
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 category:
 *                   $ref: '#/components/schemas/Category'
 *               required:
 *                 - message
 *                 - category
 *             example:
 *               message: "Category created successfully"
 *               category:
 *                 id: "some-uuid"
 *                 module: "DOGS"
 *                 category_name: "Labrador"
 *                 imageUrl: "/uploads/category-123456789.jpg"
 *       400:
 *         description: Invalid input or file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Category Name and module are required"
 *       409:
 *         description: Category already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Category Labrador already exists in module DOGS"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to create category"
 */
router.post('/', upload.single('image'), createCategory);

/**
 * @swagger
 * /api/category/{module}:
 *   get:
 *     summary: Get categories and their products or featured listings by module
 *     description: Retrieves categories and their products for a specified module (DOGS, SERVICES, APPAREL). If 'ALL' is specified or implied, returns featured products across the module. For specific categories, returns all products in that category. Supports an optional 'featured' filter to return only featured products.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: module
 *         schema:
 *           type: string
 *         required: false
 *         description: The module to filter categories (e.g., DOGS, SERVICES, APPAREL, or empty for all)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Optional category name to filter within the module (e.g., ALL, Siberian Husky)
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: If true, only returns featured products in the categories section
 *     responses:
 *       200:
 *         description: Categories and products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *             example:
 *               module: "DOGS"
 *               data:
 *                 categories:
 *                   - category_name: "ALL"
 *                     imageUrl: ""
 *                     featuredListings:
 *                       - id: 1
 *                         product_name: "Golden Retriever Puppy"
 *                         price: 500
 *                         rating: 4.5
 *                         imageUrls:
 *                           - "/uploads/image-123456789.jpg"
 *                         favoriteCount: 10
 *                         featured: true
 *                   - category_name: "Siberian Husky"
 *                     imageUrl: "/uploads/image-1746426458134-835920605.jpg"
 *                     products:
 *                       - id: 2
 *                         product_name: "Husky Puppy"
 *                         price: 600
 *                         rating: 4
 *                         imageUrls:
 *                           - "/uploads/image-987654321.jpg"
 *                         favoriteCount: 5
 *                         featured: false
 *       404:
 *         description: No categories found for the module or category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                   required:
 *                     - categories
 *                 message:
 *                   type: string
 *               required:
 *                 - data
 *                 - message
 *             example:
 *               data:
 *                 categories: []
 *               message: "No categories found for module DOGS"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch categories and products"
 */
router.get('/:module', getCategoryByModule);


/**
 * @swagger
 * /api/category/get/{module}:
 *   get:
 *     summary: Get subcategories by module type
 *     description: Retrieves a list of unique subcategories for storefronts filtered by the specified module type (e.g., DOGS, SERVICES, APPAREL). Returns the associated category ID and subcategory name.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: module
 *         schema:
 *           type: string
 *           enum: [DOGS, SERVICES, APPAREL]
 *         required: true
 *         description: The module type to filter subcategories by
 *     responses:
 *       200:
 *         description: Successfully retrieved subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoryId:
 *                     type: string
 *                     description: The unique ID of the associated category
 *                   category:
 *                     type: string
 *                     description: The name of the subcategory
 *                 example:
 *                   - categoryId: "07c1c5d3-5d82-4f4e-82a6-a780ff662538"
 *                     category: "BEAGLE"
 *                   - categoryId: "a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p"
 *                     category: "LABRADOR"
 *       400:
 *         description: Invalid module type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *             example:
 *               error: "Invalid module type. Must be one of: DOGS, SERVICES, APPAREL"
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
 *               error: "Failed to fetch subcategories"
 */
router.get('/get/:module', getSubCategoriesByModule);

module.exports = router;