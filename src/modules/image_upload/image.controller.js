import { prisma } from "../../config/db";
import logger from "../../config/logger";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/uploadImage";

export const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    // check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
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
      const publicIdMatch = product.imageUrl.match(/\/([^\/]+)\.[^.]+$/);
      if (publicIdMatch) {
        const publicId = `e-commerce/${publicIdMatch[1]}`;
        await deleteFromCloudinary(publicId).catch((err) =>
          logger.warn({ err }, "Failed to delete old image"),
        );
      }
    }

    // upload new image to cloudinary
    const newImage = await uploadToCloudinary(req.file.buffer, {
      folder: "e-commerce/products",
      public_id: `product_${id}_${Date.now()}`,
    });

    // update product with new image URL
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { imageUrl: newImage.secure_url },
    });

    res.status(200).json({
      message: "Image updated successfully",
      imageUrl: newImage.secure_url,
      product: updatedProduct,
    });
    logger.info({ productId: id }, "Product image uploaded successfully");
  } catch (error) {
    logger.error(
      { err: error, productId: req.params.id },
      "Failed to upload image",
    );
    res.status(500).json({ error: "Failed to upload image" });
  }
};
