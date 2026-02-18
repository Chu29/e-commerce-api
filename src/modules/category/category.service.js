import { prisma } from "../../config/db.js";
import logger from "../../config/logger.js";

/**
 * Creates a new category in the database.
 * @param {Object} categoryData - The category data.
 * @param {string} categoryData.name - Unique category name.
 * @param {string} [categoryData.description] - Category description.
 * @param {string} categoryData.slug - Unique URL-friendly slug.
 * @returns {Promise<Object>} The created category.
 * @throws {Error} If a database error occurs (e.g., duplicate name/slug).
 */
const createCategory = async ({ name, description, slug }) => {
  try {
    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
      },
    });
    return category;
  } catch (error) {
    logger.error({ err: error }, "Error creating category");
    throw error;
  }
};

/**
 * Searches categories by name using a partial match.
 * @param {string} searchTerm - The search term to match against category names.
 * @returns {Promise<Object[]>} Array of matching categories.
 * @throws {Error} If a database error occurs.
 */
const searchCategories = async (searchTerm) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    });
    return categories;
  } catch (error) {
    logger.error({ err: error }, "Error searching categories");
    throw error;
  }
};

export { createCategory, searchCategories };
