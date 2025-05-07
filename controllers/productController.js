const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');



const toggleProductFavorite = async (req, res) => {
    const { productId } = req.params;
    // const userId = req.user?.id;
    const userId ="1bd07686-96df-4155-96e3-ef125f300beb";
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
      });
  
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: parseInt(productId),
          },
        },
      });
  
      if (existingFavorite) {
        await prisma.favorite.delete({
          where: { id: existingFavorite.id },
        });
        res.json({ message: 'Product removed from favorites', favorited: false });
      } else {
        await prisma.favorite.create({
          data: {
            userId,
            productId: parseInt(productId),
          },
        });
        res.json({ message: 'Product added to favorites', favorited: true });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  };

  const getProductById = async (req, res) => {
    const { productId } = req.params;
    // const userId = req.user?.id;
    const userId ="1bd07686-96df-4155-96e3-ef125f300beb";
    try {
      const productIdNum = parseInt(productId);
      if (isNaN(productIdNum)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productIdNum },
        include: {
          category: true,
          favorites: userId ? { where: { userId } } : true,
          _count: { select: { favorites: true } },
          images: { select: { url: true } },
          videos: { select: { url: true } },
        },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const productData = {
        id: product.id,
        name: product.product_name,
        price: product.price || 0,
        imageUrls: product.images.map(image => image.url),
        videoUrls: product.videos.map(video => image.url),
        rating: product.rating || 0,
        shortDescription: product.shortDescription || '',
        longDescription: product.longDescription || '',
        breed: product.breed || '',
        gender: product.gender || '',
        age: product.age || 0,
        healthStatus: product.healthStatus || '',
        createdAt: product.createdAt.toISOString(),
        favoriteCount: product._count.favorites,
        isFavorited: userId ? product.favorites.length > 0 : false,
        };

      res.json(productData);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  };

  const createProduct = async (req, res) => {
    const userId = req.user?.id;
    const { images, videos } = req.files || {};
    const {
      product_name,
      price,
      categoryId,
      shortDescription,
      longDescription,
      breed,
      gender,
      age,
      healthStatus,
      rating,
    } = req.body;
  
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    if (!product_name || !categoryId) {
      return res.status(400).json({ error: 'Product name and category ID are required' });
    }
  
    try {
      // Validate user role
      // const user = await prisma.user.findUnique({ where: { id: userId } });
      // if (user.role !== 'seller' && user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Only sellers or admins can create products' });
      // }
  
      // Validate category
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // Parse and validate optional fields
      const priceNum = price !== undefined ? parseFloat(price) : undefined;
      if (price !== undefined && (isNaN(priceNum) || priceNum < 0)) {
        return res.status(400).json({ error: 'Invalid price' });
      }
  
      const ratingNum = rating !== undefined ? parseFloat(rating) : undefined;
      if (rating !== undefined && (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
        return res.status(400).json({ error: 'Invalid rating (must be between 0 and 5)' });
      }
  
      const ageNum = age ? parseInt(age) : undefined;
      if (age && (isNaN(ageNum) || ageNum < 0)) {
        return res.status(400).json({ error: 'Invalid age' });
      }
  
      // Create product and media in a transaction
      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            product_name,
            price: priceNum,
            rating: ratingNum,
            shortDescription,
            longDescription,
            breed,
            gender,
            age: ageNum,
            healthStatus,
            categoryId,
          },
        });
  
        // Create image records
        const imageRecords = images?.map(file => ({
          productId: newProduct.id,
          url: `/uploads/${file.filename}`,
        })) || [];
  
        // Create video records
        const videoRecords = videos?.map(file => ({
          productId: newProduct.id,
          url: `/uploads/${file.filename}`,
        })) || [];
  
        if (imageRecords.length > 0) {
          await tx.productImage.createMany({ data: imageRecords });
        }
  
        if (videoRecords.length > 0) {
          await tx.productVideo.createMany({ data: videoRecords });
        }
  
        return { newProduct, imageRecords, videoRecords };
      });
  
      res.status(201).json({
        message: 'Product created successfully',
        product: {
          id: product.newProduct.id,
          product_name: product.newProduct.product_name,
          price: product.newProduct.price,
          rating: product.newProduct.rating,
          shortDescription: product.newProduct.shortDescription,
          longDescription: product.newProduct.longDescription,
          breed: product.newProduct.breed,
          gender: product.newProduct.gender,
          age: product.newProduct.age,
          healthStatus: product.newProduct.healthStatus,
          categoryId: product.newProduct.categoryId,
          imageUrls: product.imageRecords.map(record => record.url),
          videoUrls: product.videoRecords.map(record => record.url),
        },
      });
    } catch (error) {
      logger.error(`Failed to create product by user ${userId}: ${error.message}`);
      // Clean up uploaded files if transaction fails
      if (images || videos) {

        [...(images || []), ...(videos || [])].forEach(file => {
          fs.unlink(path.join(__dirname, '../Uploads', file.filename), err => {
            if (err) logger.error(`Failed to delete file ${file.filename}: ${err.message}`);
          });
        });
      }
      res.status(500).json({ error: 'Failed to create product' });
    }
  };

  const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;
    const { images, videos } = req.files || {};
    const {
      product_name,
      price,
      categoryId,
      shortDescription,
      longDescription,
      breed,
      gender,
      age,
      healthStatus,
      rating,
      removeImages,
      removeVideos,
    } = req.body;
  
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    try {
      const productIdNum = parseInt(productId);
      if (isNaN(productIdNum) || productIdNum <= 0) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
  
      // Validate user role
      // const user = await prisma.user.findUnique({ where: { id: userId } });
      // if (user.role !== 'seller' && user.role !== 'admin') {
      //   return res.status(403).json({ error: 'Only sellers or admins can update products' });
      // }
  
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productIdNum },
        include: { images: true, videos: true },
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Validate category if provided
      if (categoryId) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
      }
  
      // Parse and validate optional fields
      const priceNum = price !== undefined ? parseFloat(price) : undefined;
      if (price !== undefined && (isNaN(priceNum) || priceNum < 0)) {
        return res.status(400).json({ error: 'Invalid price' });
      }
  
      const ratingNum = rating !== undefined ? parseFloat(rating) : undefined;
      if (rating !== undefined && (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
        return res.status(400).json({ error: 'Invalid rating (must be between 0 and 5)' });
      }
  
      const ageNum = age !== undefined ? parseInt(age) : undefined;
      if (age !== undefined && (isNaN(ageNum) || ageNum < 0)) {
        return res.status(400).json({ error: 'Invalid age' });
      }
  
      // Parse arrays for removing images/videos
      let removeImageUrls = [];
      let removeVideoUrls = [];
      try {
        removeImageUrls = removeImages ? JSON.parse(removeImages) : [];
        removeVideoUrls = removeVideos ? JSON.parse(removeVideos) : [];
      } catch (err) {
        return res.status(400).json({ error: 'Invalid format for removeImages or removeVideos' });
      }
  
      // Update product and media in a transaction
      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Update product fields
        const productUpdate = await tx.product.update({
          where: { id: productIdNum },
          data: {
            product_name: product_name || undefined,
            price: priceNum,
            rating: ratingNum,
            shortDescription: shortDescription !== undefined ? shortDescription : undefined,
            longDescription: longDescription !== undefined ? longDescription : undefined,
            breed: breed !== undefined ? breed : undefined,
            gender: gender !== undefined ? gender : undefined,
            age: ageNum,
            healthStatus: healthStatus !== undefined ? healthStatus : undefined,
            categoryId: categoryId || undefined,
          },
          include: { images: true, videos: true },
        });
  
        // Delete specified images
        const deletedImages = [];
        if (removeImageUrls.length > 0) {
          const imagesToDelete = await tx.productImage.findMany({
            where: { productId: productIdNum, url: { in: removeImageUrls } },
          });
          await tx.productImage.deleteMany({
            where: { productId: productIdNum, url: { in: removeImageUrls } },
          });
          deletedImages.push(...imagesToDelete);
        }
  
        // Delete specified videos
        const deletedVideos = [];
        if (removeVideoUrls.length > 0) {
          const videosToDelete = await tx.productVideo.findMany({
            where: { productId: productIdNum, url: { in: removeVideoUrls } },
          });
          await tx.productVideo.deleteMany({
            where: { productId: productIdNum, url: { in: removeVideoUrls } },
          });
          deletedVideos.push(...videosToDelete);
        }
  
        // Create new image records
        const imageRecords = images?.map(file => ({
          productId: productIdNum,
          url: `/uploads/${file.filename}`,
        })) || [];
        if (imageRecords.length > 0) {
          await tx.productImage.createMany({ data: imageRecords });
        }
  
        // Create new video records
        const videoRecords = videos?.map(file => ({
          productId: productIdNum,
          url: `/uploads/${file.filename}`,
        })) || [];
        if (videoRecords.length > 0) {
          await tx.productVideo.createMany({ data: videoRecords });
        }
  
        return { productUpdate, imageRecords, videoRecords, deletedImages, deletedVideos };
      });
  
      // Delete files for removed images/videos
      const filesToDelete = [
        ...updatedProduct.deletedImages.map(img => img.url.replace('/uploads/', '')),
        ...updatedProduct.deletedVideos.map(vid => vid.url.replace('/uploads/', '')),
      ];
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map(filename =>
            fs.unlink(path.join(__dirname, '../Uploads', filename)).catch(err =>
              logger.error(`Failed to delete file ${filename}: ${err.message}`)
            )
          )
        );
      }
  
      res.status(200).json({
        message: 'Product updated successfully',
        product: {
          id: updatedProduct.productUpdate.id,
          product_name: updatedProduct.productUpdate.product_name,
          price: updatedProduct.productUpdate.price,
          rating: updatedProduct.productUpdate.rating,
          shortDescription: updatedProduct.productUpdate.shortDescription,
          longDescription: updatedProduct.productUpdate.longDescription,
          breed: updatedProduct.productUpdate.breed,
          gender: updatedProduct.productUpdate.gender,
          age: updatedProduct.productUpdate.age,
          healthStatus: updatedProduct.productUpdate.healthStatus,
          categoryId: updatedProduct.productUpdate.categoryId,
          images: [
            ...updatedProduct.productUpdate.images
              .filter(img => !removeImageUrls.includes(img.url))
              .map(img => img.url),
            ...updatedProduct.imageRecords.map(record => record.url),
          ],
          videos: [
            ...updatedProduct.productUpdate.videos
              .filter(vid => !removeVideoUrls.includes(vid.url))
              .map(vid => vid.url),
            ...updatedProduct.videoRecords.map(record => record.url),
          ],
        },
      });
    } catch (error) {
      logger.error(`Failed to update product ${productId} by user ${userId}: ${error.message}`);
      // Clean up uploaded files if transaction fails
      if (images || videos) {
        const files = [...(images || []), ...(videos || [])];
        await Promise.all(
          files.map(file =>
            fs.unlink(path.join(__dirname, '../Uploads', file.filename)).catch(err =>
              logger.error(`Failed to delete file ${file.filename}: ${err.message}`)
            )
          )
        );
      }
      res.status(500).json({ error: 'Failed to update product' });
    }
  };

  const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user?.id;
  
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    try {
      const productIdNum = parseInt(productId);
      if (isNaN(productIdNum) || productIdNum <= 0) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
  
      // Validate user role
    //   const user = await prisma.user.findUnique({ where: { id: userId } });
    //   if (user.role !== 'seller' && user.role !== 'admin') {
    //     return res.status(403).json({ error: 'Only sellers or admins can delete products' });
    //   }
  
      // Check if product exists and fetch media
      const product = await prisma.product.findUnique({
        where: { id: productIdNum },
        include: { images: true, videos: true },
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      // Delete product and associated media in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.product.delete({
          where: { id: productIdNum },
        });
      });
  
      // Delete associated files
      const filesToDelete = [
        ...product.images.map(img => img.url.replace('/uploads/', '')),
        ...product.videos.map(vid => vid.url.replace('/uploads/', '')),
      ];
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map(filename =>
            fs.unlink(path.join(__dirname, '../Uploads', filename)).catch(err =>
              logger.error(`Failed to delete file ${filename}: ${err.message}`)
            )
          )
        );
      }
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error(`Failed to delete product ${productId} by user ${userId}: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  };
  
    module.exports = {
    toggleProductFavorite,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
    };