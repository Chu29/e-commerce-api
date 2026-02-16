import { Router } from "express";
import { createProductController } from "./product.controller.js";

const router = Router();

// POST - Create new product
router.post("/products", createProductController);

export default router;
