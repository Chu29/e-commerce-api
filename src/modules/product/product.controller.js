import { createProduct, getAllProducts } from "./product.service.js";

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
    res.status(500).json({ error: error.message });
  }
};
