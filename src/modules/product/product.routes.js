import { Router } from "express";
import {
  createProductController,
  getAllProductsController,
} from "./product.controller.js";

const router = Router();

// POST - Create new product
router.post("/products", createProductController);

// GET - Get all products
router.get("/products", getAllProductsController);

export default router;
