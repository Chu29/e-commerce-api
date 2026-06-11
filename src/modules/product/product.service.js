import { prisma } from "../../config/db.js";
import logger from "../../config/logger.js";
import { generateUniqueSKU } from "../../utils/skuGenerator.js";

/**
 * Creates a new product with an auto-generated SKU based on its category.
 * @param {Object} productData - The product data.
 * @param {string} productData.name - Product name.
 * @param {string} [productData.description] - Product description.
 * @param {number} productData.price - Product price.
 * @param {number} productData.categoryId - ID of the category the product belongs to.
 * @param {number} [productData.stockQuantity=0] - Initial stock quantity.
 * @returns {Promise<Object>} The created product.
 * @throws {Error} If the category is not found.
 */
const createProduct = async ({
  name,
  description,
  price,
  categoryId,
  stockQuantity,
}) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      const error = new Error("Category not found");
      error.status = 404;
      throw error;
    }
    const sku = await generateUniqueSKU(category.slug);
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        stockQuantity,
        sku,
      },
    });
    return product;
  } catch (error) {
    logger.error("Error creating product:", error);
    throw error;
  }
};

/**
 * Retrieves all products with their associated categories.
 * @returns {Promise<Object[]>} Array of products with category data.
 * @throws {Error} If a database error occurs.
 */
const getAllProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    return products;
  } catch (error) {
    logger.error("Error fetching all products:", error);
    throw error;
  }
};

/**
 * Searches and filters active products with pagination.
 * @param {Object} filters - Search and filter parameters.
 * @param {string} [filters.search] - Search term to match against product name or description (case-insensitive).
 * @param {number} [filters.categoryId] - Filter by category ID.
 * @param {number} [filters.minPrice] - Minimum price filter.
 * @param {number} [filters.maxPrice] - Maximum price filter.
 * @param {number} [filters.page=1] - Page number for pagination.
 * @param {number} [filters.limit=10] - Number of results per page.
 * @returns {Promise<{products: Object[], pagination: {total: number, page: number, limit: number, totalPages: number}}>} Paginated product results.
 * @throws {Error} If a database error occurs.
 */
const searchProducts = async ({
  search,
  categoryId,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
}) => {
  try {
    const where = { isActive: true };

    // search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    logger.error("Error searching products:", error);
    throw error;
  }
};

/**
 * Retrieves a single product by its ID, including category data.
 * @param {number} id - The product ID.
 * @returns {Promise<Object|null>} The product object or null if not found.
 * @throws {Error} If a database error occurs.
 */
const getProductById = async (id) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    return product;
  } catch (error) {
    logger.error("Error fetching product by ID:", error);
    throw error;
  }
};

/**
 * Updates a product by its ID with the provided data.
 * @param {number} id - The product ID.
 * @param {Object} updateData - Fields to update.
 * @param {string} [updateData.name] - Updated product name.
 * @param {string} [updateData.description] - Updated product description.
 * @param {number} [updateData.price] - Updated price.
 * @param {number} [updateData.categoryId] - Updated category ID.
 * @param {number} [updateData.stockQuantity] - Updated stock quantity.
 * @returns {Promise<Object>} The updated product.
 * @throws {Error} If the product is not found or a database error occurs.
 */
const updateProduct = async (id, updateData) => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    return product;
  } catch (error) {
    logger.error("Error updating product:", error);
    throw error;
  }
};

/**
 * Deletes a product by its ID.
 * @param {number} id - The product ID.
 * @returns {Promise<Object>} The deleted product.
 * @throws {Error} If the product is not found or a database error occurs.
 */
const deleteProduct = async (id) => {
  try {
    const product = await prisma.product.delete({
      where: { id },
    });
    return product;
  } catch (error) {
    logger.error("Error deleting product:", error);
    throw error;
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};
