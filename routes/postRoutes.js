const express = require('express');
const { 
    createPost,
    getPosts,
    getPostById,
    toggleLike,
    commentOnPost,
    editComment,
    deleteComment
} = require('../controllers/postController');

const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

/**
 * @swagger
 * /api/posts/:
 *   post:
 *     summary: Create a new post (share an advertisement)
 *     description: Creates a new post associated with an advertisement.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - advertisementId
 *             properties:
 *               advertisementId:
 *                 type: integer
 *                 example: 2
 *               content:
 *                 type: string
 *                 example: "I shared this awesome advertisement!"
 *     responses:
 *       201:
 *         description: Post created successfully
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
 *                 advertisementId:
 *                   type: integer
 *                   example: 2
 *                 content:
 *                   type: string
 *                   example: "I shared this awesome advertisement!"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Advertisement not found
 *       500:
 *         description: Server error
 */
router.post('/',verifyToken,createPost);

/**
 * @swagger
 * /api/posts/:
 *   get:
 *     summary: Get all posts
 *     description: Retrieves a list of posts, optionally filtered by advertisement ID.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: advertisementId
 *         schema:
 *           type: integer
 *         description: Filter posts by advertisement ID
 *         example: 2
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   userId:
 *                     type: string
 *                     example: "user-uuid-123"
 *                   advertisementId:
 *                     type: integer
 *                     example: 2
 *                   content:
 *                     type: string
 *                     example: "I shared this awesome advertisement!"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-22T00:00:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-22T00:00:00.000Z"
 *                   user:
 *                     type: object
 *                     properties:
 *                       full_name:
 *                         type: string
 *                         example: "John Doe"
 *                   advertisement:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Puppies Ready for Adoption"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieves details of a specific post by its ID, including likes and comments.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Post details
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
 *                 advertisementId:
 *                   type: integer
 *                   example: 2
 *                 content:
 *                   type: string
 *                   example: "I shared this awesome advertisement!"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *                 user:
 *                   type: object
 *                   properties:
 *                     full_name:
 *                       type: string
 *                       example: "John Doe"
 *                     profilePicture:
 *                       type: string
 *                       example: "/uploads/profile.jpg"
 *                 advertisement:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Puppies Ready for Adoption"
 *                     imageUrl:
 *                       type: string
 *                       example: "/uploads/puppies-adoption.png"
 *                     redirectTo:
 *                       type: string
 *                       example: "/adoptions"
 *                     redirectType:
 *                       type: string
 *                       enum: [Storefront, Announcement, Buyer, Seller, OtherLink]
 *                       example: "OtherLink"
 *                     slogan:
 *                       type: string
 *                       example: "Puppies Ready for Adoption"
 *                     description:
 *                       type: string
 *                       example: "Lorem ipsum dolor sit amet, consectetur adipiscing..."
 *                     template_index:
 *                       type: integer
 *                       example: 1
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: string
 *                         example: "user-uuid-123"
 *                       postId:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-22T00:00:00.000Z"
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: string
 *                         example: "commenter-uuid-789"
 *                       postId:
 *                         type: integer
 *                         example: 1
 *                       content:
 *                         type: string
 *                         example: "A personal touch for every pet—creating unique experiences, from portraits to personalized treats."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-29T00:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-29T00:00:00.000Z"
 *                       user:
 *                         type: object
 *                         properties:
 *                           full_name:
 *                             type: string
 *                             example: "Lila Grace"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', verifyToken, getPostById);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   put:
 *     summary: Toggle like on a post
 *     description: Toggles the like status for a post. If the user has already liked the post, it removes the like; otherwise, it adds a like.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to toggle like on
 *         example: 1
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action:
 *                   type: string
 *                   enum: [liked, unliked]
 *                   example: "liked"
 *                 message:
 *                   type: string
 *                   example: "Post liked successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id/like', verifyToken, toggleLike);


/**
 * @swagger
 * /api/posts/{id}/comment:
 *   post:
 *     summary: Comment on a post
 *     description: Allows a user to comment on a post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to comment on
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a great post!"
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *                 postId:
 *                   type: integer
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: "This is a great post!"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/:id/comment', verifyToken, commentOnPost);

/**
 * @swagger
 * /api/posts/{id}/comment/{commentId}:
 *   put:
 *     summary: Edit a comment on a post
 *     description: Allows a user to edit their own comment on a post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post
 *         example: 1
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to edit
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                 postId:
 *                   type: integer
 *                   example: 1
 *                 content:
 *                   type: string
 *                   example: "Updated comment content"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T00:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-22T01:00:00.000Z"
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the comment author)
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
router.put('/:id/comment/:commentId', verifyToken, editComment);

/**
 * @swagger
 * /api/posts/{id}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment on a post
 *     description: Allows a user to delete their own comment on a post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post
 *         example: 1
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the comment author)
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/comment/:commentId', verifyToken, deleteComment);

module.exports = router;