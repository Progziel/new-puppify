const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { calculateStatus } = require('../utils/meeting');

const getMeetings = async (req, res) => {
    try {
      const { status = 'all' } = req.query;
      const userId = req.user.id; // UUID string from JWT
      // Build where clause
      const where = { userId };
      if (status !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
  
        if (status === 'today') {
          where.dateTime = {
            gte: today,
            lt: tomorrow,
          };
        } else if (status === 'upcoming') {
          where.dateTime = {
            gte: tomorrow,
          };
        } else if (status === 'completed') {
          where.dateTime = {
            lt: today,
          };
        }
      }
  
      // Fetch meetings
      const meetings = await prisma.meeting.findMany({
        where,
        include: {
          product: { select: { name: true, imageUrl: true } },
          user: { select: { full_name: true } },
        },
      });
  
      // Format response
      const formattedMeetings = meetings.map((meeting) => ({
        id: meeting.id,
        productName: meeting.product.name,
        productImageUrl: meeting.product.imageUrl || null,
        personName: meeting.user.full_name || 'Unknown',
        dateTime: meeting.dateTime,
        status: calculateStatus(meeting.dateTime),
      }));
  
      logger.info(`Fetched ${meetings.length} meetings for user ${userId} with status ${status}`);
      res.json(formattedMeetings);
    } catch (error) {
      logger.error(`Error in getMeetings: ${error.message}`);
      res.status(500).json({ message: 'Error fetching meetings' });
    }
  };

  module.exports = {
    getMeetings,

};
