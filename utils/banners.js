const logger = require('./logger'); // Your logger module
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Task to set isActive to false for advertisements older than 7 days
const deactivateOldAdvertisements = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find advertisements older than 7 days that are still active
    const oldAdvertisements = await prisma.advertisement.findMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
        isActive: true,
      },
    });

    if (oldAdvertisements.length === 0) {
      logger.info('No active advertisements older than 7 days found.');
      return;
    }

    // Update advertisements to set isActive to false
    const updated = await prisma.advertisement.updateMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    logger.info(`Deactivated ${updated.count} advertisements older than 7 days.`);
  } catch (error) {
    logger.error(`Error in deactivateOldAdvertisements cron job: ${error.message}`);
  }
};

module.exports = {
  deactivateOldAdvertisements,
};