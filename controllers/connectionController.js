const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const connectionRequest = async (req, res) => {
    try {
      const senderId = req.user.id;
      const { receiverId } = req.body;
  
      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' });
      }
  
      if (senderId === receiverId) {
        return res.status(400).json({ message: 'Cannot connect with yourself' });
      }
  
      const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }
  
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        include: { connections: true },
      });
      const alreadyConnected = sender.connections.some(user => user.id === receiverId);
      if (alreadyConnected) {
        return res.status(400).json({ message: 'Already connected with this user' });
      }
  
      const existingRequest = await prisma.connectionRequest.findFirst({
        where: {
          senderId,
          receiverId,
          status: 'PENDING',
        },
      });
      if (existingRequest) {
        return res.status(400).json({ message: 'Connection request already sent' });
      }
  
      const request = await prisma.connectionRequest.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
        },
      });
      logger.info(`Connection request sent from user ${senderId} to ${receiverId}`);
      res.status(201).json({ message: 'Connection request sent', request });
    } catch (error) {
      logger.error(`Error in sendConnectionRequest: ${error.message}`);
      res.status(500).json({ message: 'Error sending connection request' });
    }
  };

  const acceptRequest = async (req, res) => {
    try {
      const userId = req.user.id;
      const requestId = req.params.id;
  
      const request = await prisma.connectionRequest.findUnique({
        where: { id: requestId },
        include: { sender: true, receiver: true },
      });
      if (!request) {
        return res.status(404).json({ message: 'Connection request not found' });
      }
  
      if (request.receiverId !== userId) {
        return res.status(403).json({ message: 'Only the receiver can accept this request' });
      }
  
      if (request.status !== 'PENDING') {
        return res.status(400).json({ message: 'Request is not pending' });
      }
  
      // Sort user IDs to maintain consistency (userId1 < userId2)
      const userId1 = request.senderId < request.receiverId ? request.senderId : request.receiverId;
      const userId2 = request.senderId < request.receiverId ? request.receiverId : request.senderId;
  
      // Create a ConnectedAccount record
      await prisma.connectedAccount.create({
        data: {
          userId1,
          userId2,
        },
      });
  
      // Delete the ConnectionRequest record
      await prisma.connectionRequest.delete({
        where: { id: requestId },
      });
  
      logger.info(`Connection request ${requestId} accepted by user ${userId}. ConnectedAccount created.`);
      res.json({ message: 'Connection request accepted' });
    } catch (error) {
      logger.error(`Error in acceptConnectionRequest: ${error.message}`);
      res.status(500).json({ message: 'Error accepting connection request' });
    }
  }

  const rejectRequest = async (req, res) => {
    try {
      const userId = req.user.id;
      const requestId = req.params.id;
  
      const request = await prisma.connectionRequest.findUnique({
        where: { id: requestId },
      });
      if (!request) {
        return res.status(404).json({ message: 'Connection request not found' });
      }
  
      if (request.receiverId !== userId) {
        return res.status(403).json({ message: 'Only the receiver can reject this request' });
      }
  
      if (request.status !== 'PENDING') {
        return res.status(400).json({ message: 'Request is not pending' });
      }
  
      // Delete the ConnectionRequest record
      await prisma.connectionRequest.delete({
        where: { id: requestId },
      });
  
      logger.info(`Connection request ${requestId} rejected and deleted`);
      res.json({ message: 'Connection request rejected and deleted' });
    } catch (error) {
      logger.error(`Error in rejectConnectionRequest: ${error.message}`);
      res.status(500).json({ message: 'Error rejecting connection request' });
    }
  };
  
  const cancelRequest = async (req, res) => {
    try {
      const userId = req.user.id;
      const requestId = req.params.id;
  
      const request = await prisma.connectionRequest.findUnique({
        where: { id: requestId },
      });
      if (!request) {
        return res.status(404).json({ message: 'Connection request not found' });
      }
  
      if (request.senderId !== userId) {
        return res.status(403).json({ message: 'Only the sender can cancel this request' });
      }
  
      if (request.status !== 'PENDING') {
        return res.status(400).json({ message: 'Request is not pending' });
      }
  
      await prisma.connectionRequest.delete({
        where: { id: requestId },
       });
  
      logger.info(`Connection request ${requestId} canceled by user ${userId}`);
      res.json({ message: 'Connection request canceled' });
    } catch (error) {
      logger.error(`Error in cancelConnectionRequest: ${error.message}`);
      res.status(500).json({ message: 'Error canceling connection request' });
    }
  }

  const getPendingConnection = async (req, res) => {
    try {
      const userId = req.user.id || req.user.userId;
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Fetch sent pending requests
      const sent = await prisma.connectionRequest.findMany({
        where: {
          senderId: userId,
          status: 'PENDING',
        },
        include: {
          receiver: {
            select: {
              id: true,
              full_name: true,
              profilePicture: true,
            },
          },
        },
      });
  
      // Fetch received pending requests
      const received = await prisma.connectionRequest.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          sender: {
            select: {
              id: true,
              full_name: true,
              profilePicture: true,
            },
          },
        },
      });
  
      // Format response
      const response = {
        sent: sent.map(request => ({
          id: request.id,
          receiver: request.receiver,
        })),
        received: received.map(request => ({
          id: request.id,
          sender: request.sender,
        })),
      };
  
      logger.info(`Fetched pending connections for user ${userId}: ${sent.length} sent, ${received.length} received`);
      res.json(response);
    } catch (error) {
      logger.error(`Error in getPendingConnection: ${error.message}`);
      res.status(500).json({ message: 'Error fetching pending connections' });
    }
  };

  const getConnectedAccount = async (req, res) => {
    try {
      const userId = req.user.id || req.user.userId;
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Fetch connections where user is either userId1 or userId2
      const connectionsAsUser1 = await prisma.connectedAccount.findMany({
        where: { userId1: userId },
        include: {
          user2: {
            select: {
              id: true,
              full_name: true,
              profilePicture: true,
            },
          },
        },
      });
  
      const connectionsAsUser2 = await prisma.connectedAccount.findMany({
        where: { userId2: userId },
        include: {
          user1: {
            select: {
              id: true,
              full_name: true,
              profilePicture: true,
            },
          },
        },
      });
  
      // Combine and format connections
      const connections = [
        ...connectionsAsUser1.map(conn => conn.user2),
        ...connectionsAsUser2.map(conn => conn.user1),
      ];
  
      const response = {
        connections,
        connectionCount: connections.length,
      };
  
      logger.info(`Fetched connected accounts for user ${userId}: ${response.connectionCount} connections`);
      res.json(response);
    } catch (error) {
      logger.error(`Error in getConnectedAccount: ${error.message}`);
      res.status(500).json({ message: 'Error fetching connected accounts' });
    }
  };

  const removeConnectedAccount = async (req, res) => {
    try {
      const userId = req.user.id || req.user.userId;
      const otherUserId = req.params.userId;
  
      if (userId === otherUserId) {
        return res.status(400).json({ message: 'Cannot disconnect from yourself' });
      }
  
      // Find the ConnectedAccount record (userId1 < userId2 ordering)
      const connection = await prisma.connectedAccount.findFirst({
        where: {
          OR: [
            { userId1: userId, userId2: otherUserId },
            { userId1: otherUserId, userId2: userId },
          ],
        },
      });
  
      if (!connection) {
        return res.status(404).json({ message: 'Connected account not found' });
      }
  
      // Delete the ConnectedAccount record
      await prisma.connectedAccount.delete({
        where: { id: connection.id },
      });
  
      logger.info(`User ${userId} disconnected from user ${otherUserId}`);
      res.json({ message: 'Connected account removed' });
    } catch (error) {
      logger.error(`Error in removeConnectedAccount: ${error.message}`);
      res.status(500).json({ message: 'Error removing connected account' });
    }
  };
  

  module.exports = {
    connectionRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    getPendingConnection,
    getConnectedAccount,
    removeConnectedAccount

};
