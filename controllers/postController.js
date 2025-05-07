const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const createPost = async (req, res) => {
  try {
    const { advertisementId, content } = req.body;
    const userId = req.user.id;

    if (!advertisementId) {
      return res.status(400).json({ message: 'Advertisement ID is required' });
    }

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: parseInt(advertisementId) },
    });

    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    const post = await prisma.post.create({
      data: {
        userId,
        advertisementId: parseInt(advertisementId),
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info(`Created post ${post.id} by user ${userId}`);
    res.status(201).json(post);
  } catch (error) {
    logger.error(`Error in createPost: ${error.message}`);
    res.status(500).json({ message: 'Error creating post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const { advertisementId } = req.query;

    const where = {};
    if (advertisementId) {
      where.advertisementId = parseInt(advertisementId);
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            full_name: true,
          },
        },
        advertisement: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info(`Fetched ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    logger.error(`Error in getPosts: ${error.message}`);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            full_name: true,
            profilePicture:true
          },
        },
        advertisement: {
          select: {
            title: true,
            imageUrl:true,
            redirectTo:true,
            redirectType:true,
            slogan:true,
            description:true,
            template_index:true
          },
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    logger.info(`Fetched post ${postId}`);
    res.json(post);
  } catch (error) {
    logger.error(`Error in getPostById: ${error.message}`);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // User has already liked the post, so unlike it
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      logger.info(`User ${userId} unliked post ${postId}`);
      return res.json({ action: 'unliked', message: 'Post unliked successfully' });
    } else {
      // User hasn't liked the post, so like it
      await prisma.like.create({
        data: {
          userId,
          postId,
          createdAt: new Date(),
        },
      });
      logger.info(`User ${userId} liked post ${postId}`);
      return res.json({ action: 'liked', message: 'Post liked successfully' });
    }
  } catch (error) {
    logger.error(`Error in toggleLike: ${error.message}`);
    res.status(500).json({ message: 'Error toggling like on post' });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info(`User ${userId} commented on post ${postId}`);
    res.status(201).json(comment);
  } catch (error) {
    logger.error(`Error in commentOnPost: ${error.message}`);
    res.status(500).json({ message: 'Error commenting on post' });
  }
};

const editComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    if (comment.postId !== postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    logger.info(`User ${userId} edited comment ${commentId} on post ${postId}`);
    res.json(updatedComment);
  } catch (error) {
    logger.error(`Error in editComment: ${error.message}`);
    res.status(500).json({ message: 'Error editing comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    if (comment.postId !== postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    logger.info(`User ${userId} deleted comment ${commentId} on post ${postId}`);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteComment: ${error.message}`);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

  module.exports = {
    createPost,
    getPosts,
    getPostById,
    toggleLike,
    commentOnPost,
    editComment,
    deleteComment
};