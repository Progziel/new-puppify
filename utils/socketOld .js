const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/jwt");
const logger = require("../utils/logger");
const { redisClient, pubClient, subClient } = require("../config/redis");
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

const socketOldSetup = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Set up Redis adapter
  try {
    io.adapter(require("socket.io-redis")({ pubClient, subClient }));
    logger.info("Redis adapter set up successfully");
  } catch (err) {
    logger.error(`Failed to set up Redis adapter: ${err.message}`);
    throw new Error("Redis adapter setup failed");
  }

  // Redis Pub/Sub subscriptions
  const channels = ["chat_channel"];
  channels.forEach((channel) => {
    subClient.subscribe(channel, (err) => {
      if (err) logger.error(`Failed to subscribe to ${channel}: ${err.message}`);
      else logger.info(`Subscribed to ${channel}`);
    });
  });

  // Handle Redis Pub/Sub messages
  subClient.on("message", (channel, message) => {
    try {
      const data = JSON.parse(message);
      logger.debug(`Received on ${channel}: ${message}`);
      switch (channel) {
        case "chat_channel":
          // Emit to the specific recipient
          const recipientSocketId = data.recipientSocketId;
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive_message", data.message);
            // Emit typing status if included
            if (data.typing) {
              io.to(recipientSocketId).emit("user_typing", { senderId: data.senderId });
            }
          }
          break;
      }
    } catch (err) {
      logger.error(`Error processing ${channel} message: ${err.message}`);
    }
  });

  // User management with Redis
  const registerUser = async (userId, socketId) => {
    try {
      await redisClient
        .multi()
        .hset("online_users", userId, socketId)
        .hset("online_users_reverse", socketId, userId)
        .hset("user_status", userId, "online")
        .expire(`user_status:${userId}`, 24 * 60 * 60) // 24-hour TTL
        .exec();
      logger.info(`User ${userId} registered with socket ${socketId}`);
    } catch (err) {
      logger.error(`Error registering user ${userId}: ${err.message}`);
      throw err;
    }
  };

  const removeUser = async (socketId) => {
    try {
      const userId = await redisClient.hget("online_users_reverse", socketId);
      if (userId) {
        await redisClient
          .multi()
          .hdel("online_users", userId)
          .hdel("online_users_reverse", socketId)
          .hset("user_status", userId, "offline")
          .exec();
        logger.info(`User ${userId} removed from online users`);
        return userId;
      }
      return null;
    } catch (err) {
      logger.error(`Error removing user with socket ${socketId}: ${err.message}`);
      throw err;
    }
  };

  // Socket.IO middleware for JWT authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn("No token provided in handshake");
      return next(new Error("Authentication error: No token provided."));
    }
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        logger.warn(`Token verification failed: ${err.message}`);
        return next(new Error("Authentication error: Invalid or expired token."));
      }
      socket.user = decoded;
      next();
    });
  });

  // Connection handler
  io.on("connection", (socket) => {
    logger.info(`User connected (Socket ID: ${socket.id}, User ID: ${socket.user.id})`);

    // Register user
    socket.on("register_user", async (userId) => {
      try {
        // Validate userId exists in the database
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          socket.emit("error_event", { message: "Invalid user ID." });
          return;
        }
        await registerUser(userId, socket.id);
        io.emit("user_status_update", { userId, status: "online" });
        logger.info(`User registered: ${userId}`);
      } catch (err) {
        socket.emit("error_event", { message: "Failed to register user." });
      }
    });

    // Handle sending a message
    socket.on("send_message", async (data) => {
      const { receiverId, content } = data;
      const senderId = socket.user.id; // Changed from socket.user.userId to socket.user.id

      try {
        // Validate receiver exists
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
          socket.emit("error_event", { message: "Receiver not found." });
          return;
        }

        // Validate sender exists
        const sender = await prisma.user.findUnique({ where: { id: senderId } });
        if (!sender) {
          socket.emit("error_event", { message: "Sender not found." });
          return;
        }

        // Save the message to the database
        const message = await prisma.message.create({
          data: {
            id: `msg-uuid-${Math.random().toString(36).substr(2, 9)}`,
            sender: { connect: { id: senderId } },
            receiver: { connect: { id: receiverId } },
            content,
            createdAt: new Date(),
            isRead: false,
          },
        });

        // Prepare the message data to broadcast
        const messageData = {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          createdAt: message.createdAt,
          isRead: message.isRead,
        };

        // Check if the receiver is online
        const recipientSocketId = await redisClient.hget("online_users", receiverId);

        // Publish the message to Redis Pub/Sub
        const publishData = {
          message: messageData,
          recipientSocketId: recipientSocketId || null,
          senderId,
        };
        await pubClient.publish("chat_channel", JSON.stringify(publishData));

        // Emit the message back to the sender for confirmation
        socket.emit("message_sent", messageData);

        logger.info(`Message sent from ${senderId} to ${receiverId}: ${content}`);
      } catch (err) {
        logger.error(`Error sending message: ${err.message}`);
        socket.emit("error_event", { message: "Failed to send message." });
      }
    });

    // Handle marking a message as read
    socket.on("mark_read", async (messageId) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { sender: true, receiver: true },
        });
        if (!message) {
          socket.emit("error_event", { message: "Message not found." });
          return;
        }

        // Verify the user is the receiver of the message
        if (message.receiverId !== socket.user.id) { // Changed from socket.user.userId to socket.user.id
          socket.emit("error_event", { message: "Unauthorized to mark this message as read." });
          return;
        }

        await prisma.message.update({
          where: { id: messageId },
          data: { isRead: true },
        });

        // Notify the sender that the message was read
        const senderSocketId = await redisClient.hget("online_users", message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message_read", { messageId });
        }

        logger.info(`Message ${messageId} marked as read by user ${socket.user.id}`); // Changed from socket.user.userId to socket.user.id
      } catch (err) {
        logger.error(`Error marking message as read: ${err.message}`);
        socket.emit("error_event", { message: "Failed to mark message as read." });
      }
    });

    // Handle typing indicator
    socket.on("typing", async (data) => {
      const { receiverId } = data;
      const senderId = socket.user.id; // Changed from socket.user.userId to socket.user.id

      try {
        // Validate receiver exists
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
          socket.emit("error_event", { message: "Receiver not found." });
          return;
        }

        // Check if the receiver is online
        const recipientSocketId = await redisClient.hget("online_users", receiverId);
        if (recipientSocketId) {
          // Publish typing event to Redis Pub/Sub
          const publishData = {
            senderId,
            recipientSocketId,
            typing: true,
          };
          await pubClient.publish("chat_channel", JSON.stringify(publishData));
        }
      } catch (err) {
        logger.error(`Error handling typing event: ${err.message}`);
        socket.emit("error_event", { message: "Failed to send typing indicator." });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      try {
        const userId = await removeUser(socket.id);
        if (userId) {
          io.emit("user_status_update", { userId, status: "offline" });
          logger.info(`User ${userId} disconnected (Socket ID: ${socket.id})`);
        }
      } catch (err) {
        logger.error(`Error handling disconnect: ${err.message}`);
      }
    });
  });

  // Scalability Note: For very high traffic, consider integrating a message queue like RabbitMQ
  // to handle message broadcasting and ensure reliability across server instances.

  return io;
};

module.exports = socketOldSetup;