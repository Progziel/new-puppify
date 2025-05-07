const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const createAdvertisement = async (req, res) => {
  try {
    const { title, redirectTo, redirectType, slogan, description, isActive, advertisementType, template_index } = req.body;

    if (!title || !req.file || !redirectTo || !redirectType || !slogan || !description || !advertisementType) {
      return res.status(400).json({ message: 'All fields, image, and advertisementType are required' });
    }

    if (!['Banner', 'Announcement', 'Dog', 'Service', 'Apparel'].includes(advertisementType)) {
      return res.status(400).json({ message: 'Invalid advertisement type' });
    }

    if (!['Storefront', 'Announcement', 'Buyer', 'Seller', 'OtherLink'].includes(redirectType)) {
      return res.status(400).json({ message: 'Invalid redirect type' });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // Local storage

    const advertisement = await prisma.advertisement.create({
      data: {
        title,
        imageUrl,
        redirectTo,
        redirectType,
        slogan,
        description,
        isActive: isActive !== undefined ? isActive === 'true' : true,
        advertisementType,
        template_index: template_index ? parseInt(template_index) : 0,
      },
    });

    logger.info(`Advertisement created with ID ${advertisement.id}`);
    res.status(201).json({ message: 'Advertisement created', advertisement });
  } catch (error) {
    logger.error(`Error in createAdvertisement: ${error.message}`);
    res.status(500).json({ message: 'Error creating advertisement' });
  }
};

const getAdvertisements = async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const adType = req.query.advertisementType;

    let query = 'SELECT * FROM "Advertisement"';
    const conditions = [];

    if (!showAll) {
      conditions.push('"isActive" = true');
    }

    if (adType && ['Banner', 'Announcement', 'Dog', 'Service', 'Apparel'].includes(adType)) {
      conditions.push(`"advertisementType" = '${adType}'`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY RANDOM()';

    const advertisements = await prisma.$queryRawUnsafe(query);

    logger.info(`Fetched ${advertisements.length} advertisements`);
    res.json(advertisements);
  } catch (error) {
    logger.error(`Error in getAdvertisements: ${error.message}`);
    res.status(500).json({ message: 'Error fetching advertisements' });
  }
};

const updateAdvertisement = async (req, res) => {
  try {
    const advertisementId = parseInt(req.params.id);
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive field is required' });
    }

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: advertisementId },
    });

    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    const updatedAdvertisement = await prisma.advertisement.update({
      where: { id: advertisementId },
      data: {
        isActive: isActive === 'true' || isActive === true,
      },
    });
    logger.info(`Advertisement ${advertisementId} updated`);
    res.json({ message: 'Advertisement updated', advertisement: updatedAdvertisement });
  } catch (error) {
    logger.error(`Error in updateAdvertisement: ${error.message}`);
    res.status(500).json({ message: 'Error updating advertisement' });
  }
};

const deleteAdvertisement = async (req, res) => {
  try {
    const advertisementId = parseInt(req.params.id);

    const advertisement = await prisma.advertisement.findUnique({
      where: { id: advertisementId },
    });

    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    // Delete the image file from Uploads folder
    if (advertisement.imageUrl) {
      const imagePath = path.join(__dirname, '..', advertisement.imageUrl);
      await fs.unlink(imagePath).catch(err => {
        logger.error(`Failed to delete image ${advertisement.imageUrl}: ${err.message}`);
      });
    }

    await prisma.advertisement.delete({
      where: { id: advertisementId },
    });
    logger.info(`Advertisement ${advertisementId} deleted`);
    res.json({ message: 'Advertisement deleted' });
  } catch (error) {
    logger.error(`Error in deleteAdvertisement: ${error.message}`);
    res.status(500).json({ message: 'Error deleting advertisement' });
  }
};

  module.exports = {
    createAdvertisement,
    getAdvertisements,
    updateAdvertisement,
    deleteAdvertisement
};