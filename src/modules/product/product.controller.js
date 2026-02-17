import logger from "../../config/logger.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "./product.service.js";

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

export const getAllProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({ products });
  } catch (error) {
    logger.error("Error fetching all products:", error);
    res.status(500).json({ error: error.message });
  }
};

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

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, stockQuantity } = req.body;

    if (id) {
      const productId = parseInt(id, 10);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const updatedProduct = await updateProduct(productId, {
        name,
        description,
        price,
        categoryId,
        stockQuantity,
      });
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
