import logger from "../../config/logger.js";
import { createCategory, getAllCategories } from "./category.service.js";

const sendInternalServerError = (res, message, error) =>
  res.status(500).json({
    error:
      process.env.NODE_ENV === "development" ? error.message : message,
  });

const isUniqueConstraintError = (error) => error?.code === "P2002";

const isPrismaClientValidationError = (error) =>
  error?.name === "PrismaClientValidationError";

const isBlankString = (value) =>
  typeof value !== "string" || value.trim() === "";

/**
 * Handles POST request to create a new category.
 * @param {import('express').Request} req - Express request with name, description, and slug in body.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const createCategoryController = async (req, res, next) => {
  try {
    const { name, description, slug } = req.body;

    if (isBlankString(name) || isBlankString(slug)) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    // create new category via service layer
    const newCategory = await createCategory({
      name: name.trim(),
      description,
      slug: slug.trim(),
    });

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    logger.error("Unexpected error in createCategoryController:", error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: "Category already exists" });
    }
    if (isPrismaClientValidationError(error)) {
      return res.status(400).json({ error: "Invalid category data" });
    }
    return sendInternalServerError(res, "Error creating category", error);
  }
};

/**
 * Handles GET request to retrieve all categories.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getAllCategoriesController = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({
      message: "Categories retrieved successfully",
      categories: categories,
    });
  } catch (error) {
    logger.error("Unexpected error in getAllCategoriesController:", error);
    return sendInternalServerError(res, "Error retrieving categories", error);
  }
};
