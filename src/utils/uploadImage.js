import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

/**
 * Upload image to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "e-commerce",
        resource_type: "image",
        transformation: options.transformation || [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Generates an optimized Cloudinary image URL with transformations.
 * @param {string} publicId - Cloudinary public ID.
 * @param {Object} [options={}] - Transformation options.
 * @param {Array} [options.transformation] - Custom Cloudinary transformations.
 * @returns {string} Optimized image URL.
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    transformation: options.transformation || [
      { width: 500, height: 500, crop: "fill" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
    ...options,
  });
};
