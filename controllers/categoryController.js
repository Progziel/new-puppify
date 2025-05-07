const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const {shuffleArray} = require('../utils/meeting');

const createCategory = async (req, res) => {
  const { category_name, module} = req.body;

  if (!category_name || !module) {
    return res.status(400).json({ error: 'Category Name and module are required' });
  }

  const normalizedModule = module.toUpperCase();
  if (!['DOGS', 'SERVICES', 'APPAREL'].includes(normalizedModule)) {
    return res.status(400).json({ error: 'Invalid module. Must be DOGS, SERVICES, or APPAREL' });
  }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // Generate the URL based on the uploaded file
    }

  try {
        // Check if the category already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            module: module.toUpperCase(),
            category_name: category_name.toUpperCase(),
          },
        });
    
        if (existingCategory) {
          return res.status(409).json({ error: `Category ${category_name} already exists in module ${module}` });
        }

    const newCategory = await prisma.category.create({
      data: {
        category_name,
        module: normalizedModule,
        imageUrl: imageUrl,
      },
    });

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const getCategoryByModule = async (req, res) => {
  const module = req.params.module ? req.params.module.toUpperCase() : null;
  const categoryName = req.query.category ? req.query.category.toUpperCase() : null;
  const featuredOnly = req.query.featured === 'true'; // Optional filter for featured products

  const validModules = ['DOGS', 'SERVICES', 'APPAREL'];
  const fetchAll = !module || module.trim() === '' || !validModules.includes(module);

  try {
    let categories;
    if (fetchAll) {
      categories = await prisma.category.findMany({
        include: {
          products: {
            where: featuredOnly ? { featured: true } : undefined,
            select: {
              id: true,
              product_name: true,
              price: true,
              rating: true,
              images: { select: { url: true } },
              favorites: { select: { id: true } },
              featured: true,
            },
          },
        },
      });
    } else {
      const whereClause = { module };
      if (categoryName) {
        whereClause.category_name = categoryName;
      }

      categories = await prisma.category.findMany({
        where: whereClause,
        include: {
          products: {
            where: featuredOnly ? { featured: true } : undefined,
            select: {
              id: true,
              product_name: true,
              price: true,
              rating: true,
              images: { select: { url: true } },
              favorites: { select: { id: true } },
              featured: true,
            },
          },
        },
      });

      if (categories.length === 0) {
        return res.status(404).json({
          data: { categories: [] },
          message: categoryName
            ? `Category ${categoryName} not found in module ${module}`
            : `No categories found for module ${module}`,
        });
      }
    }

    // Prepare the categories response
    const categoriesResponse = await Promise.all(
      categories.map(async (category) => {
        const categoryData = {
          category_name: category.category_name,
          imageUrl: category.imageUrl,
        };

        if (category.category_name === 'ALL' || (categoryName === 'ALL' && categories.length === 1)) {
          const featuredProducts = await prisma.product.findMany({
            where: {
              category: { module },
              featured: true,
            },
            select: {
              id: true,
              product_name: true,
              price: true,
              rating: true,
              images: { select: { url: true } },
              favorites: { select: { id: true } },
              featured: true,
            },
          });

          categoryData.featuredListings = featuredProducts.map((product) => ({
            id: product.id,
            product_name: product.product_name,
            price: product.price ?? 0,
            rating: product.rating ?? 0,
            imageUrls: product.images.map((image) => image.url),
            favoriteCount: product.favorites.length,
            featured: product.featured,
          }));
        } else {
          categoryData.products = category.products.map((product) => ({
            id: product.id,
            product_name: product.product_name,
            price: product.price ?? 0,
            rating: product.rating ?? 0,
            imageUrls: product.images.map((image) => image.url),
            favoriteCount: product.favorites.length,
            featured: product.featured,
          }));
        }

        return categoryData;
      })
    );

    res.json({
      module: fetchAll ? 'ALL' : module,
      data: {
        categories: categoriesResponse,
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch categories: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch categories and products' });
  }
};

const getSubCategoriesByModule = async (req, res) => {
  const { module } = req.params;

  // Validate module type
  const validModules = ['DOGS', 'SERVICES', 'APPAREL'];
  if (!validModules.includes(module.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid module type. Must be one of: DOGS, SERVICES, APPAREL' });
  }

  try {
    const categories = await prisma.category.findMany({
      where: {
        module: module.toUpperCase(),
      },
      select: {
        id: true,
        category_name: true,
      },
    });

    // Map to the desired response format
    const response = categories.map(category => ({
      categoryId: category.id,
      subCategory: category.category_name,
    }));

    res.json(response);
  } catch (error) {
    logger.error(`Failed to fetch categories: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};



module.exports = {
  createCategory,
  getCategoryByModule,
  getSubCategoriesByModule
};