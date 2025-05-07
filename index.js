require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./utils/logger");
const authRoutes = require("./routes/authRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const postRoutes = require("./routes/postRoutes");
const messagegRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storefrontRoutes = require('./routes/storefrontRoutes');

const { scheduleCronJob } = require("./utils/cronScheduler");
const http = require("http");
const socketSetup = require("./utils/socket");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swagger");
const { PrismaClient } = require("./generated/prisma");

const app = express();
const PORT = process.env.PORT || 3000;
const environment = process.env.NODE_ENV;
const HOST = process.env.HOST || "0.0.0.0";

// Initialize Prisma Client
const prisma = new PrismaClient();

const { deleteOTP } = require("./utils/otp");
const {deactivateOldAdvertisements} = require('./utils/banners');

// Schedule cron job to run every 30 miniutes delete expired OTPs
const scheduleDeleteOTP = () => {
  scheduleCronJob("*/30 * * * *", deleteOTP);
};
// Schedule the task to run daily at midnight delete 7days-old banners
const scheduleDeactiveOldAds=()=>{
scheduleCronJob('0 0 * * *', deactivateOldAdvertisements)
};

scheduleDeleteOTP();
scheduleDeactiveOldAds();
// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Validate environment variables
if (!environment || !["production", "development", "testing"].includes(environment)) {
  logger.error("Invalid NODE_ENV. Exiting...");
  process.exit(1);
}

// Check Prisma database connection
(async () => {
  try {
    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Prisma database connected successfully.");
  } catch (error) {
    logger.error(`Failed to connect to the Prisma database: ${error.message}`);
    process.exit(1);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use('/uploads', express.static('uploads'));
const morganFormat = (tokens, req, res) => {
  return [
    tokens["remote-addr"](req, res),
    "-",
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length") || "0",
    tokens["response-time"](req, res) + " ms",
  ].join(" ");
};

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/advertisement", advertisementRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/messages", messagegRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/posts", postRoutes);
app.use('/notifications', notificationRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/storefront",storefrontRoutes)

// Health check endpoint to verify database connection
app.get("/health", async (req, res) => {
  try {
    // Perform a simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: "API and database are up and running.",
      database: "connected",
    });
  } catch (error) {
    logger.error(`Database health check failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Database connection failed.",
      database: "disconnected",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is up and running.",
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
socketSetup(server);

// Clean shutdown
process.on("SIGINT", async () => {
  logger.info("Gracefully shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
server.listen(PORT, HOST, () => {
  logger.info(`Server is running on http://${HOST}:${PORT} in ${environment} mode.`);
});