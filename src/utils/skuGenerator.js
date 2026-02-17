import { nanoid } from "nanoid";
import { prisma } from "../config/db.js";

/**
 * Extracts the first 3 characters of a category slug as an uppercase prefix.
 * @param {string} slug - The category slug.
 * @returns {string} Uppercase 3-character prefix.
 */
const categoryPrefix = (slug) => {
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
  const prefix = categoryPrefix(categorySlug);
  let sku;
  let isUnique = false;

  while (!isUnique) {
    sku = generateSKU(prefix);
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });
    if (!existingProduct) {
      isUnique = true;
    }
  }

  return sku;
};

export { generateUniqueSKU };
