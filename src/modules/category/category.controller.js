import logger from "../../config/logger.js";
import { createCategory, getAllCategories } from "./category.service.js";

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

    // create new category via service layer
    const newCategory = await createCategory({ name, description, slug });

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    logger.error("Unexpected error in createCategoryController:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Error creating category", error: error.message });
    }
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
    return res
      .status(500)
      .json({ message: "Error retrieving categories", error: error.message });
  }
};
