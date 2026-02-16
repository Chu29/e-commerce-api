import { nanoid } from "nanoid";
import { prisma } from "../config/db.js";

const categoryPrefix = (slug) => {
  return slug.substring(0, 3).toUpperCase();
};

const generateSKU = (prefix) => {
  return `${prefix}-${nanoid(6).toUpperCase()}`;
};

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
