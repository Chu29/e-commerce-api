import { prisma } from "../../config/db.js";
import logger from "../../config/logger.js";

// create a category
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
    logger.error("Error creating category:", error);
    throw error;
  }
};

// search categories by name
const searchCategories = async (searchTerm) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
    });
    return categories;
  } catch (error) {
    logger.error("Error searching categories:", error);
    throw error;
  }
};

export { createCategory, searchCategories };
