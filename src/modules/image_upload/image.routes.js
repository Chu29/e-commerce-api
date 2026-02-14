import { Router } from "express";
import {
  deleteProductImage,
  uploadMiddleware,
  uploadProductImage,
} from "./image.controller.js";

const router = Router();

// upload image route
router.post("/product/:id/image", uploadMiddleware, uploadProductImage);

// delete image route
router.delete("/product/:id/image", deleteProductImage);

export default router;
