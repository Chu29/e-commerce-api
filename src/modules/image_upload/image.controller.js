import { prisma } from "../../config/db.js";
import logger from "../../config/logger.js";
import upload from "../../middleware/upload.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/uploadImage.js";

/**
 * Helper function to extract Cloudinary public ID from image URL
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {string|null} - Public ID or null if invalid
 */
const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;

  try {
    // Match Cloudinary URL pattern: /upload/[optional transformations]/[optional version]/folder/file.ext
    // This regex handles URLs with or without transformations and version numbers
    const match = imageUrl.match(
      /\/upload\/(?:v\d+\/)?(?:[^/]+\/)*([^/]+\/[^/.]+)/,
    );

    if (match && match[1]) {
      return match[1]; // Returns folder/filename without extension
    }

    // Fallback: try to extract from the end of URL (for simpler formats)
    const fallbackMatch = imageUrl.match(/([^/]+\/[^/]+)\.[^.]+$/);
    return fallbackMatch ? fallbackMatch[1] : null;
  } catch (error) {
    logger.error({ err: error, imageUrl }, "Failed to extract public ID");
    return null;
  }
};

/**
 * Handles POST request to upload or replace a product image.
 * Uploads the image to Cloudinary and updates the product's imageUrl.
 * Deletes the previous image from Cloudinary if one exists.
 * @param {import('express').Request} req - Express request with `id` param and image file.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate and sanitize id parameter
    const productId = parseInt(id, 10);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    // check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // delete old image from cloudinary if exists
    if (product.imageUrl) {
      const publicId = extractPublicId(product.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId).catch((err) =>
          logger.warn({ err }, "Failed to delete old image"),
        );
      }
    }

    // upload new image to cloudinary
    const newImage = await uploadToCloudinary(req.file.buffer, {
      folder: "e-commerce/products",
      public_id: `product_${productId}_${Date.now()}`,
    });

    // update product with new image URL
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl: newImage.secure_url },
    });

    res.status(200).json({
      message: "Image updated successfully",
      imageUrl: newImage.secure_url,
      product: updatedProduct,
    });
    logger.info({ productId }, "Product image uploaded successfully");
  } catch (error) {
    logger.error(
      { err: error, productId: req.params.id },
      "Failed to upload image",
    );
    res.status(500).json({ error: "Failed to upload image" });
  }
};

/**
 * Handles DELETE request to remove a product's image.
 * Deletes the image from Cloudinary and sets imageUrl to null.
 * @param {import('express').Request} req - Express request with `id` param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
export const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate and sanitize id parameter
    const productId = parseInt(id, 10);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.imageUrl) {
      return res.status(400).json({ error: "Product does not have an image" });
    }

    // Extract public ID from URL and delete from cloudinary
    const publicId = extractPublicId(product.imageUrl);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId);
        logger.info({ publicId, productId }, "Image deleted from Cloudinary");
      } catch (cloudinaryError) {
        // Log the error but continue with database update
        // This ensures we can still remove the URL even if Cloudinary deletion fails
        logger.warn(
          { err: cloudinaryError, publicId, productId },
          "Failed to delete image from Cloudinary, but will update database",
        );
      }
    }

    // update product to remove the image URL
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl: null },
    });

    res.status(200).json({
      message: "Image deleted successfully",
      product: updatedProduct,
    });

    logger.info({ productId }, "Product image deleted successfully");
  } catch (error) {
    logger.error(
      { err: error, productId: req.params.id },
      "Failed to delete image",
    );
    res.status(500).json({ error: "Failed to delete image" });
  }
};

/** Multer middleware configured for single image upload with field name "image". */
export const uploadMiddleware = upload.single("image");
