import logger from "../../config/logger.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  searchProducts,
} from "./product.service.js";

/**
 * Handles POST request to create a new product.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, categoryId, stockQuantity } = req.body;
    const newProduct = await createProduct({
      name,
      description,
      price,
      categoryId,
      stockQuantity,
    });
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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

    if (id) {
      const productId = parseInt(id, 10);

      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const product = await getProductById(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res
        .status(200)
        .json({ message: "Product retrieved successfully", product });
    }
  } catch (error) {
    logger.error("Error fetching product by ID:", error);
    res.status(500).json({ error: error.message });
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
    const { name, description, price, categoryId, stockQuantity } = req.body;

    if (id) {
      const productId = parseInt(id, 10);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      // Only include defined fields in the update object
      const updateFields = {};
      if (name !== undefined && name !== null) updateFields.name = name;
      if (description !== undefined && description !== null)
        updateFields.description = description;
      if (price !== undefined && price !== null) updateFields.price = price;
      if (categoryId !== undefined && categoryId !== null)
        updateFields.categoryId = categoryId;
      if (stockQuantity !== undefined && stockQuantity !== null)
        updateFields.stockQuantity = stockQuantity;

      const updatedProduct = await updateProduct(productId, updateFields);
      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    }
  } catch (error) {
    logger.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
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

    const result = await searchProducts({
      search,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    res.status(200).json({
      message: "Products retrieved successfully",
      ...result,
    });
  } catch (error) {
    logger.error("Error searching products:", error);
    res.status(500).json({ error: error.message });
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
    if (id) {
      const productId = parseInt(id, 10);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const deletedProduct = await deleteProduct(productId);
      res.status(200).json({
        message: "Product deleted successfully",
        product: deletedProduct,
      });
    }
  } catch (error) {
    logger.error("Error deleting product:", error);
    res.status(500).json({ error: error.message });
  }
};
