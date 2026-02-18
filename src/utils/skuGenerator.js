import { nanoid } from "nanoid";
import { prisma } from "../config/db.js";

/**
 * Extracts the first 3 characters of a category slug as an uppercase prefix.
 * @param {string} slug - The category slug.
 * @returns {string} Uppercase 3-character prefix.
 */
const categoryPrefix = (slug) => {
  if (!slug || typeof slug !== "string") {
    throw new Error("Invalid category slug: must be a non-empty string");
  }
  return slug.substring(0, 3).toUpperCase();
};

/**
 * Generates a SKU string from a prefix and a random 6-character nanoid.
 * @param {string} prefix - The category prefix.
 * @returns {string} The generated SKU (e.g., "ELE-A1B2C3").
 */
const generateSKU = (prefix) => {
  return `${prefix}-${nanoid(6).toUpperCase()}`;
};

/**
 * Generates a unique SKU for a product by checking against existing SKUs in the database.
 * Retries with a new random ID if a collision is found.
 * @param {string} categorySlug - The category slug used to derive the SKU prefix.
 * @returns {Promise<string>} A unique SKU string.
 */
const generateUniqueSKU = async (categorySlug) => {
  const MAX_SKU_ATTEMPTS = 10;
  const prefix = categoryPrefix(categorySlug);
  let sku;
  let isUnique = false;
  let attempts = 0;

  while (!isUnique) {
    while (!isUnique && attempts < MAX_SKU_ATTEMPTS) {
      attempts++;
      sku = generateSKU(prefix);
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });
      if (!existingProduct) {
        isUnique = true;
      }
    }
    if (!isUnique) {
      throw new Error(
        `Failed to generate a unique SKU after ${MAX_SKU_ATTEMPTS} attempts`,
      );
    }
  }

  return sku;
};

export { generateUniqueSKU };
