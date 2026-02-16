import { Router } from "express";
import { createCategoryController } from "./category.controller.js";

const router = Router();

// Create new category
router.post("/categories", createCategoryController);

export default router;
