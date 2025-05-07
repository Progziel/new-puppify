const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const getOrders = async (req, res) => {
    try {
      const userId = req.user.id; // From authMiddleware
      const search = req.query.search?.toLowerCase();
  
      const where = {
        userId,
      };
  
      if (search) {
        where.product = {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        };
      }
  
      const orders = await prisma.order.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
              price: true,
              rating: true,
              description: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Most recent first
        },
      });
  
      // Map the orders to return only the product details
      const productDetails = orders.map(order => order.product);
  
      logger.info(`Fetched ${productDetails.length} product details for user ${userId}`);
      res.json(productDetails);
    } catch (error) {
      logger.error(`Error in getOrders: ${error.message}`);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  };

const getOrderById = async (req, res) => {
    try {
      const userId = req.user.id; // From authMiddleware
      const orderId = parseInt(req.params.id);
  
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
              price: true,
              rating: true,
              description: true,
            },
          },
        },
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      if (order.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden: Order does not belong to user' });
      }
  
      logger.info(`Fetched order ${orderId} for user ${userId}`);
      res.json(order);
    } catch (error) {
      logger.error(`Error in getOrderById: ${error.message}`);
      res.status(500).json({ message: 'Error fetching order' });
    }
  };

  const cancelOrder = async (req, res) => {
    try {
      const userId = req.user.id; // From authMiddleware
      const orderId = parseInt(req.params.id);
  
      // Check if the order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Verify the order belongs to the user
      if (order.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden: Order does not belong to user' });
      }
  
      // Check if the order is already canceled
      if (order.status === 'CANCELED') {
        return res.status(400).json({ message: 'Order is already canceled' });
      }
  
      // Update the order status to CANCELED
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELED' },
      });
  
      logger.info(`Order ${orderId} canceled (soft deletion) by user ${userId}`);
      res.status(200).json({ message: 'Order canceled successfully' });
    } catch (error) {
      logger.error(`Error in cancelOrder: ${error.message}`);
      res.status(500).json({ message: 'Error canceling order' });
    }
  };
  
module.exports = {
    getOrders,
    getOrderById,
    cancelOrder
};