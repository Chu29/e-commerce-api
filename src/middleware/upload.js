import multer from "multer";
import path from "path";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

/**
 * File filter callback for multer. Accepts only image files.
 * @param {import('express').Request} req - Express request object.
 * @param {Express.Multer.File} file - The uploaded file.
 * @param {import('multer').FileFilterCallback} cb - Multer callback.
 */
const fileFilter = (req, file, cb) => {
  const allowedExt = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".avif",
  ]);
  const ext = path.extname(file.originalname).toLowerCase();
  // Accept only image files
  if (file.mimetype.startsWith("image/") && allowedExt.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

/**
 * Configured multer instance for handling file uploads.
 * Uses memory storage, 5MB size limit, and image-only filter.
 * @type {import('multer').Multer}
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter,
});

export default upload;
