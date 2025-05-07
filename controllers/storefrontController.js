const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

const createStorefront = async (req, res) => {
    const {
      title,
      storeType,
      subcategory,
      categoryId,
      shortDescription,
      longDescription,
      phone,
      email,
      operatingHours,
      location,
      template_index,
      templateImageAltText, // Added for templateImage altText
    } = req.body;
  
    // Extract files from req.files
    const imageFiles = req.files?.images || [];
    const videoFiles = req.files?.videos || [];
    const templateImageFile = req.files?.templateImage?.[0]; // Expect a single file for templateImage
  
    // Generate URLs for uploaded files (assuming storage in 'uploads' directory)
    const imageUrls = imageFiles.map(file => `/uploads/${file.filename}`);
    const videoUrls = videoFiles.map(file => `/uploads/${file.filename}`);
    const templateImageUrl = templateImageFile ? `/uploads/${templateImageFile.filename}` : null;
  
    // Validate required fields
    if (!title || !storeType || !subcategory || !categoryId || !shortDescription || !longDescription || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    // Validate storeType
    const validStoreTypes = ['DOGS', 'SERVICES', 'APPAREL'];
    if (!validStoreTypes.includes(storeType.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid storeType. Must be one of: DOGS, SERVICES, APPAREL' });
    }
   // Validate and parse location (still a Json field)
   let parsedLocation = {};
   if (location) {
     try {
       parsedLocation = JSON.parse(location);
       if (typeof parsedLocation !== 'object' || Array.isArray(parsedLocation)) {
         return res.status(400).json({ error: 'location must be a valid JSON object' });
       }
       // Optionally validate location structure
       if (parsedLocation.lat !== undefined && typeof parsedLocation.lat !== 'number') {
         return res.status(400).json({ error: 'location.lat must be a number' });
       }
       if (parsedLocation.lng !== undefined && typeof parsedLocation.lng !== 'number') {
         return res.status(400).json({ error: 'location.lng must be a number' });
       }
     } catch (error) {
       logger.error(`Invalid location JSON: ${location}, Error: ${error.message}`);
       return res.status(400).json({ error: 'Invalid location JSON format' });
     }
   }
    try {
      const storefront = await prisma.storefront.create({
        data: {
          title,
          storeType: storeType.toUpperCase(),
          subcategory,
          category: { connect: { id: categoryId } },
          shortDescription,
          longDescription,
          phone,
          email,
          operatingHours: operatingHours || '',
          location: parsedLocation,
          template_index: template_index !== undefined ? parseInt(template_index) : 0,
          images: {
            create: imageUrls.map(url => ({ url })),
          },
          videos: {
            create: videoUrls.map(url => ({ url })),
          },
          templateImage: templateImageUrl
            ? {
                create: {
                  imageUrl: templateImageUrl,
                  altText: templateImageAltText || null, // Use provided altText or null
                },
              }
            : undefined, // Only create templateImage if a file was uploaded
        },
        include: {
          images: true,
          videos: true,
          templateImage: true, // Include templateImage in the response
        },
      });
  
      res.status(201).json({
        id: storefront.id,
        title: storefront.title,
        imageUrls: storefront.images.map((image) => image.url),
        videoUrls: storefront.videos.map((video) => video.url),
        templateImage: storefront.templateImage
          ? {
              url: storefront.templateImage.imageUrl,
              altText: storefront.templateImage.altText,
            }
          : null, // Include templateImage details in response
        storeType: storefront.storeType,
        subcategory: storefront.subcategory,
        categoryId: storefront.categoryId,
        shortDescription: storefront.shortDescription,
        longDescription: storefront.longDescription,
        phone: storefront.phone,
        email: storefront.email,
        operatingHours: storefront.operatingHours,
        location: storefront.location,
        createdAt: storefront.createdAt,
        updatedAt: storefront.updatedAt,
        template_index: storefront.template_index,
      });
    } catch (error) {
      logger.error(`Failed to create storefront: ${error.message}`);
      res.status(500).json({ error: 'Failed to create storefront' });
    }
};

const getStorefrontById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const storefront = await prisma.storefront.findUnique({
        where: {
          id,
        },
        include: {
          images: true,
          videos: true,
          templateImage: true,
        },
      });
  
      if (!storefront) {
        return res.status(404).json({ error: 'Storefront not found' });
      }
  
      res.status(200).json({
        id: storefront.id,
        title: storefront.title,
        imageUrls: storefront.images.map((image) => image.url),
        videoUrls: storefront.videos.map((video) => video.url),
        templateImage: storefront.templateImage
          ? {
              url: storefront.templateImage.imageUrl,
              altText: storefront.templateImage.altText,
            }
          : null,
        storeType: storefront.storeType,
        subcategory: storefront.subcategory,
        categoryId: storefront.categoryId,
        shortDescription: storefront.shortDescription,
        longDescription: storefront.longDescription,
        phone: storefront.phone,
        email: storefront.email,
        operatingHours: storefront.operatingHours,
        location: storefront.location,
        createdAt: storefront.createdAt,
        updatedAt: storefront.updatedAt,
        template_index: storefront.template_index,
      });
    } catch (error) {
      logger.error(`Failed to fetch storefront: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch storefront' });
    }
  };


  module.exports = {
    createStorefront,
    
    getStorefrontById
  };