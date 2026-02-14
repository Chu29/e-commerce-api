import { Router } from "express";
import {
  deleteProductImage,
  uploadMiddleware,
  uploadProductImage,
} from "./image.controller.js";

const router = Router();

// upload image route
router.post("/api/product/:id/image", uploadMiddleware, uploadProductImage);

// delete image route
router.delete("/api/product/:id/image", uploadMiddleware, deleteProductImage);

export default router;
