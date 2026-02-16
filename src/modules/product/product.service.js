import { prisma } from "../../config/db.js";
import logger from "../../config/logger.js";
import { generateUniqueSKU } from "../../utils/skuGenerator.js";

// create new product
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
      throw new Error("Category not found");
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

// get all products
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

// get product by id

// update product

// delete a product

export { createProduct, getAllProducts };
