const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { calculateStatus } = require('../utils/meeting');

const getAppointments = async (req, res) => {
    try {
      const { status = 'all' } = req.query;
      const userId = req.user.id;
  
      // Build where clause for filtering
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
        // Fetch appointments
      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          service: { select: { name: true, imageUrl: true } },
          user: { select: { full_name: true } },
        },
      });
        // Format response
      const formattedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        serviceName: appointment.service.name,
        serviceImageUrl: appointment.service.imageUrl || null,
        personName: appointment.user.full_name || 'Unknown',
        dateTime: appointment.dateTime,
        status: calculateStatus(appointment.dateTime), // Dynamic status
      }));
      logger.info(`Fetched ${appointments.length} appointments for user ${userId} with status ${status}`);
      res.json(formattedAppointments);
    } catch (error) {
      logger.error(`Error in getAppointments: ${error.message}`);
      res.status(500).json({ message: 'Error fetching appointments' });
    }
  };

  module.exports = {
    getAppointments,

};
