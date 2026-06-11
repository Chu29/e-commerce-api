import { Router } from "express";
import {
  deleteProductImage,
  uploadMiddleware,
  uploadProductImage,
} from "./image.controller.js";

const router = Router();

/**
 * @swagger
 * /product/{id}/image:
 *   post:
 *     summary: Upload or replace a product image
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB, image types only)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image updated successfully"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/example/image/upload/v1/e-commerce/products/product_1.jpg"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID or no image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to upload image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// upload image route
router.post("/product/:id/image", uploadMiddleware, uploadProductImage);

/**
 * @swagger
 * /product/{id}/image:
 *   delete:
 *     summary: Delete a product's image
 *     tags: [Product Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID or product has no image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to delete image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// delete image route
router.delete("/product/:id/image", deleteProductImage);

export default router;
