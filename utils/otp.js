const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const randomstring = require("randomstring");
const logger = require("./logger"); // Import logger (ensure this path is correct)

// Generate a 6-digit numeric OTP
const generateOTP = () => {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
};

// Delete expired OTPs using Prisma
const deleteOTP = async () => {
  try {
    const now = new Date();
    const result = await prisma.otp.deleteMany({
      where: {
        otpExpiresAt: {
          lt: now, // Delete OTPs where otpExpiresAt is in the past
        },
      },
    });
    logger.info(`Deleted ${result.count} expired OTPs`);
  } catch (error) {
    logger.error(`Error deleting expired OTPs: ${error.message}`);
  }
};

module.exports = {
  generateOTP,
  deleteOTP,
};