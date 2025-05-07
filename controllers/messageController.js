const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const getConversations = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch all messages where the user is either the sender or receiver
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              full_name: true,
              profilePicture: true,
            },
          },
          receiver: {
            select: {
              id: true,
              full_name: true,
              profilePicture: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      // Group messages by conversation (other user's ID)
      const conversations = {};
      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        if (!conversations[otherUserId]) {
          conversations[otherUserId] = {
            otherUser: message.senderId === userId ? message.receiver : message.sender,
            messages: [],
          };
        }
        conversations[otherUserId].messages.push(message);
      }
  
      // Format the response
      const conversationList = await Promise.all(
        Object.keys(conversations).map(async (otherUserId) => {
          const conv = conversations[otherUserId];
          const messages = conv.messages;
  
          // Get the last message
          const lastMessage = messages[0]; // Already sorted by createdAt descending
  
          // Count unread messages (messages sent to the user that are unread)
          const unreadCount = messages.filter(
            (msg) => msg.receiverId === userId && !msg.isRead
          ).length;
  
          return {
            otherUser: {
              id: conv.otherUser.id,
              full_name: conv.otherUser.full_name,
              profilePicture: conv.otherUser.profilePicture,
            },
            lastMessage: {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
            },
            unreadCount,
          };
        })
      );
  
      // Sort conversations by the last message's timestamp
      conversationList.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  
      logger.info(`Fetched ${conversationList.length} conversations for user ${userId}`);
      res.json(conversationList);
    } catch (error) {
      logger.error(`Error in getConversations: ${error.message}`);
      res.status(500).json({ message: 'Error fetching conversations' });
    }
  };
  
  const getMessagesById = async (req, res) => {
    try {
      const userId = req.user.id;
      const otherUserId = req.params.otherUserId;
  
      // Verify the other user exists
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: {
          id: true,
          full_name: true,
          profilePicture: true,
        },
      });
  
      if (!otherUser) {
        return res.status(404).json({ message: 'Other user not found' });
      }
  
      // Fetch all messages between the two users
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: {
          createdAt: 'asc', // Oldest to newest
        },
      });
  
      // Mark unread messages as read (messages sent to the user)
      const unreadMessageIds = messages
        .filter((msg) => msg.receiverId === userId && !msg.isRead)
        .map((msg) => msg.id);
  
      if (unreadMessageIds.length > 0) {
        await prisma.message.updateMany({
          where: {
            id: { in: unreadMessageIds },
          },
          data: {
            isRead: true,
          },
        });
        logger.info(`Marked ${unreadMessageIds.length} messages as read for user ${userId} in conversation with ${otherUserId}`);
      }
  
      // Fetch meetings between the two users
      const meetings = await prisma.meeting.findMany({
        where: {
          OR: [
            { userId: userId, invitedId: otherUserId },
            { userId: otherUserId, invitedId: userId },
          ],
        },
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
              price:true,
            },
          },
        },
      });
  
      // Format the meetings response
      const formattedMeetings = meetings.map((meeting) => ({
        id: meeting.id,
        product: {
          name: meeting.product.name,
          imageUrl: meeting.product.imageUrl,
          price: meeting.product.price,  
        },
        dateTime: meeting.dateTime,
        status: meeting.status,
      }));
  
      const response = {
        otherUser: {
          id: otherUser.id,
          full_name: otherUser.full_name,
          profilePicture: otherUser.profilePicture,
        },
        messages,
        meetings: formattedMeetings,
      };
  
      logger.info(`Fetched conversation between user ${userId} and ${otherUserId}`);
      res.json(response);
    } catch (error) {
      logger.error(`Error in getMessagesById: ${error.message}`);
      res.status(500).json({ message: 'Error fetching conversation' });
    }
  };


module.exports = {
    getConversations,
    getMessagesById
};