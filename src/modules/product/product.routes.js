import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
} from "./product.controller.js";

const router = Router();

// POST - Create new product
router.post("/products", createProductController);

// GET - Get all products
router.get("/products", getAllProductsController);

// GET - Get product by ID
router.get("/products/:id", getProductByIdController);

// PATCH - Update a product
router.patch("/products/:id");

// DELETE - Delete a product
router.delete("/products/:id", deleteProductController);

export default router;
