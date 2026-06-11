import logger from "../../config/logger.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  searchProducts,
} from "./product.service.js";

const sendInternalServerError = (res, error) =>
  res.status(500).json({
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
  });

const isMissingRecordError = (error) => error?.code === "P2025";

const isForeignKeyConstraintError = (error) => error?.code === "P2003";

const isPrismaClientValidationError = (error) =>
  error?.name === "PrismaClientValidationError";

const isBlankValue = (value) =>
  value === null || (typeof value === "string" && value.trim() === "");

const parsePositiveInteger = (value) => {
  if (isBlankValue(value)) return undefined;
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
};

const parseNonNegativeInteger = (value) => {
  if (isBlankValue(value)) return undefined;
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
};

const parseNonNegativeNumber = (value) => {
  if (isBlankValue(value)) return undefined;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
};

/**
 * Handles POST request to create a new product.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, categoryId, stockQuantity } = req.body;
    if (!name || price === undefined || categoryId === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const parsedPrice = parseNonNegativeNumber(price);
    const parsedCategoryId = parsePositiveInteger(categoryId);
    const parsedStockQuantity =
      stockQuantity === undefined
        ? undefined
        : parseNonNegativeInteger(stockQuantity);

    if (
      parsedPrice === undefined ||
      parsedCategoryId === undefined ||
      (stockQuantity !== undefined && parsedStockQuantity === undefined)
    ) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    const newProduct = await createProduct({
      name,
      description,
      price: parsedPrice,
      categoryId: parsedCategoryId,
      stockQuantity: parsedStockQuantity ?? 0,
    });
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    logger.error("Error creating product:", error);
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    if (isPrismaClientValidationError(error)) {
      return res.status(400).json({ error: "Invalid product data" });
    }
    return sendInternalServerError(res, error);
  }
};

/**
 * Handles GET request to retrieve all products.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({ products });
  } catch (error) {
    logger.error("Error fetching all products:", error);
    return sendInternalServerError(res, error);
  }
};

/**
 * Handles GET request to retrieve a product by its ID.
 * @param {import('express').Request} req - Express request with `id` param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const productId = parsePositiveInteger(id);

    if (productId === undefined) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const product = await getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product retrieved successfully", product });
  } catch (error) {
    logger.error("Error fetching product by ID:", error);
    if (isPrismaClientValidationError(error)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    return sendInternalServerError(res, error);
  }
};

/**
 * Handles PATCH request to update an existing product.
 * @param {import('express').Request} req - Express request with `id` param and update fields in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, stockQuantity, imageUrl } =
      req.body;

    const productId = parsePositiveInteger(id);
    if (productId === undefined) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Only include defined fields in the update object
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (price !== undefined) {
      const parsedPrice = parseNonNegativeNumber(price);
      if (parsedPrice === undefined) {
        return res.status(400).json({ error: "Invalid product data" });
      }
      updateFields.price = parsedPrice;
    }
    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateFields.categoryId = null;
      } else {
        const parsedCategoryId = parsePositiveInteger(categoryId);
        if (parsedCategoryId === undefined) {
          return res.status(400).json({ error: "Invalid product data" });
        }
        updateFields.categoryId = parsedCategoryId;
      }
    }
    if (stockQuantity !== undefined) {
      const parsedStockQuantity = parseNonNegativeInteger(stockQuantity);
      if (parsedStockQuantity === undefined) {
        return res.status(400).json({ error: "Invalid product data" });
      }
      updateFields.stockQuantity = parsedStockQuantity;
    }

    const updatedProduct = await updateProduct(productId, updateFields);
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    logger.error("Error updating product:", error);
    if (isMissingRecordError(error)) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (isForeignKeyConstraintError(error)) {
      return res.status(404).json({ error: "Category not found" });
    }
    if (isPrismaClientValidationError(error)) {
      return res.status(400).json({ error: "Invalid product data" });
    }
    return sendInternalServerError(res, error);
  }
};

/**
 * Handles GET request to search and filter products.
 * @param {import('express').Request} req - Express request with query params: search, categoryId, minPrice, maxPrice, page, limit.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const searchProductsController = async (req, res) => {
  try {
    const { search, categoryId, minPrice, maxPrice, page, limit } = req.query;

    const parsedCategoryId = categoryId
      ? parsePositiveInteger(categoryId)
      : undefined;
    const parsedMinPrice = minPrice
      ? parseNonNegativeNumber(minPrice)
      : undefined;
    const parsedMaxPrice = maxPrice
      ? parseNonNegativeNumber(maxPrice)
      : undefined;
    const parsedPage = page ? parsePositiveInteger(page) : 1;
    const parsedLimit = limit ? parsePositiveInteger(limit) : 10;

    if (
      (categoryId && parsedCategoryId === undefined) ||
      (minPrice && parsedMinPrice === undefined) ||
      (maxPrice && parsedMaxPrice === undefined) ||
      parsedPage === undefined ||
      parsedLimit === undefined
    ) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const result = await searchProducts({
      search,
      categoryId: parsedCategoryId,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.status(200).json({
      message: "Products retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error("Error searching products:", error);
    if (isPrismaClientValidationError(error)) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    return sendInternalServerError(res, error);
  }
};

/**
 * Handles DELETE request to remove a product by its ID.
 * @param {import('express').Request} req - Express request with `id` param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const productId = parsePositiveInteger(id);
    if (productId === undefined) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const deletedProduct = await deleteProduct(productId);
    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    logger.error("Error deleting product:", error);
    if (isMissingRecordError(error)) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (isPrismaClientValidationError(error)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    return sendInternalServerError(res, error);
  }
};
