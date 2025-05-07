const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/jwt");
const logger = require("../utils/logger");
const { redisClient, pubClient, subClient } = require("../config/redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { PrismaClient } = require("../generated/prisma");
const { sendMessageNotification } = require("../controllers/notificationController");

const prisma = new PrismaClient();

const socketSetup = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
    },
  });

  // Use Redis adapter for Socket.IO
  io.adapter(createAdapter(pubClient, subClient));

  // Redis keys
  const ONLINE_USERS_KEY = "online:users"; // Set for online user IDs
  const LAST_SEEN_KEY_PREFIX = "user:lastSeen:"; // Hash for last seen timestamps

  // Socket.IO middleware for JWT authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      socket.user = user;
      socket.userId = user.id; // Store userId for client-side reference
      next();
    } catch (err) {
      logger.error("Socket authentication error:", err.message);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`User connected: ${user.full_name} (${user.id})`);
  
    (async () => {
      try {
        const result = await redisClient.sadd(ONLINE_USERS_KEY, user.id);
        const onlineUsers = await redisClient.smembers(ONLINE_USERS_KEY);
  
        const lastSeen = new Date().toISOString();
        await redisClient.hset(`${LAST_SEEN_KEY_PREFIX}${user.id}`, 'lastSeen', lastSeen);
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'online', lastSeen: new Date(lastSeen) },
        });
  
        const allSockets = await io.fetchSockets();
        const socketIds = allSockets.map(s => s.id);
  
        socket.broadcast.emit('user-connected', { full_name: user.full_name, id: user.id });
      } catch (err) {
        logger.error(`Error in connection handler for user ${user.id}: ${err.message}`);
      }
    })();

    // Join a Redis channel for each conversation
    socket.on('join-conversation', async ({ receiverId }) => {
      try {
        const channel = getConversationChannel(user.id, receiverId);
        socket.join(channel);
        // logger.info(`User ${user.id} joined channel ${channel}`);
    
        const roomSockets = await io.in(channel).fetchSockets();
        const socketIds = roomSockets.map(s => s.id);
        // logger.info(`Sockets in channel ${channel}: ${JSON.stringify(socketIds)}`);
    
   
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: user.id, receiverId },
              { senderId: receiverId, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: 'asc' },
          include: { sender: true, receiver: true },
        });
    
        await prisma.message.updateMany({
          where: {
            senderId: receiverId,
            receiverId: user.id,
            isRead: false,
          },
          data: { isRead: true },
        });
    
        socket.emit('conversation-history', { receiverId, messages });
        // logger.info(`Sent conversation history to ${user.id} for receiver ${receiverId}: ${messages.length} messages`);
      } catch (err) {
        logger.error(`Error joining conversation for user ${user.id}: ${err.message}`);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Fetch online users and their last seen timestamps
    socket.on("get-online-users", async (callback) => {
      try {
        const onlineUserIds = await redisClient.smembers(ONLINE_USERS_KEY);
        const onlineUsers = [];

        for (const userId of onlineUserIds) {
          const lastSeen = await redisClient.hget(`${LAST_SEEN_KEY_PREFIX}${userId}`, "lastSeen");
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, full_name: true },
          });
          if (user) {
            onlineUsers.push({
              id: user.id,
              full_name: user.full_name,
              lastSeen: lastSeen || null,
              isOnline: true,
            });
          }
        }

        callback({ status: "success", users: onlineUsers });
      } catch (err) {
        logger.error("Error fetching online users:", err.message);
        callback({ status: "error", message: "Failed to fetch online users" });
      }
    });

    // Handle sending a message
    socket.on('send-chat-message', async ({ receiverId, content }) => {
      try {
        logger.info(`User ${user.id} sending message to ${receiverId}: ${content}`);
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
          logger.error(`Receiver ${receiverId} not found`);
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }
    
        const isBlocked = await prisma.user.findFirst({
          where: {
            id: receiverId,
            blockedUsers: { some: { id: user.id } },
          },
        });
        if (isBlocked) {
          logger.info(`User ${user.id} is blocked by ${receiverId}`);
          socket.emit('error', { message: 'You are blocked by this user' });
          return;
        }
    
        const message = await prisma.message.create({
          data: {
            senderId: user.id,
            receiverId,
            content,
          },
          include: { sender: true, receiver: true },
        });
    
        const messageData = {
          id: message.id,
          sender: { id: message.senderId, full_name: message.sender.full_name },
          receiver: { id: message.receiverId, full_name: message.receiver.full_name },
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          isRead: message.isRead,
        };
    
        const channel = getConversationChannel(user.id, receiverId);
        const roomSockets = await io.in(channel).fetchSockets();
        const socketIds = roomSockets.map(s => s.id);
        // logger.info(`Sockets in channel ${channel} before emitting message: ${JSON.stringify(socketIds)}`);
    
        io.to(channel).emit('chat-message', messageData);
        logger.info(`Emitted chat-message to channel ${channel}: ${JSON.stringify(messageData)}`);
     
       // Send FCM notification if the receiver is offline
       const isReceiverOnline = await redisClient.sismember(ONLINE_USERS_KEY, receiverId);
       if (!isReceiverOnline) {
         await sendMessageNotification(receiverId, user.id, content, message.id);
         logger.info(`Sent FCM message notification to ${receiverId} from ${user.id}`);
       }
      } catch (err) {
        logger.error(`Error sending message for user ${user.id}: ${err.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    // Handle Redis messages
    // subClient.on("message", (channel, message) => {
    //   try {
    //     const messageData = JSON.parse(message);
    //     io.to(channel).emit("chat-message", messageData);
    //   } catch (err) {
    //     logger.error("Error processing Redis message:", err.message);
    //   }
    // });

    // Handle user disconnection
    socket.on('disconnect', async () => {
      try {
        await redisClient.srem(ONLINE_USERS_KEY, user.id);
        // logger.info(`Removed user ${user.id} from online:users set`);
        const lastSeen = new Date().toISOString();
        await redisClient.hset(`${LAST_SEEN_KEY_PREFIX}${user.id}`, 'lastSeen', lastSeen);
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'offline', lastSeen: new Date(lastSeen) },
        });
  
        const allSockets = await io.fetchSockets();
        const socketIds = allSockets.map(s => s.id);
        // logger.info(`All connected sockets before user-disconnected broadcast for ${user.id}: ${JSON.stringify(socketIds)}`);
  
        socket.broadcast.emit('user-disconnected', { full_name: user.full_name, id: user.id });
        // logger.info(`Broadcasted user-disconnected for ${user.full_name} (${user.id}) to all other clients`);
        // logger.info(`User disconnected: ${user.full_name} (${user.id})`);
      } catch (err) {
        logger.error(`Error in disconnect handler for user ${user.id}: ${err.message}`);
      }
    });
  });

  return io;
};

// Helper function to generate a consistent Redis channel name for a conversation
const getConversationChannel = (userId1, userId2) => {
  const ids = [userId1, userId2].sort();
  return `chat:${ids[0]}:${ids[1]}`;
};

module.exports = socketSetup;