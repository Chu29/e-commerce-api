import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import logger from "../src/config/logger.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// Seed data
const categories = [
  {
    name: "Electronics",
    description: "Electronic devices and accessories",
    slug: "electronics",
  },
  {
    name: "Clothing",
    description: "Fashion and apparel for all occasions",
    slug: "clothing",
  },
  {
    name: "Books",
    description: "Books, magazines, and reading materials",
    slug: "books",
  },
  {
    name: "Home & Garden",
    description: "Home decor, furniture, and gardening supplies",
    slug: "home-garden",
  },
  {
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    slug: "sports-outdoors",
  },
];

const products = [
  // Electronics
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-canceling headphones with 30-hour battery life",
    price: "129.99",
    categorySlug: "electronics",
    stockQuantity: 45,
    sku: "ELEC-HEAD-001",
    imageUrl: "https://example.com/images/headphones.jpg",
    isActive: true,
  },
  {
    name: "Smartphone Stand",
    description: "Adjustable aluminum phone holder for desk",
    price: "24.99",
    categorySlug: "electronics",
    stockQuantity: 120,
    sku: "ELEC-STAND-002",
    imageUrl: "https://example.com/images/phone-stand.jpg",
    isActive: true,
  },
  {
    name: "USB-C Charging Cable",
    description: "Fast charging cable 6ft braided design",
    price: "15.99",
    categorySlug: "electronics",
    stockQuantity: 200,
    sku: "ELEC-CABLE-003",
    imageUrl: "https://example.com/images/usb-cable.jpg",
    isActive: true,
  },
  // Clothing
  {
    name: "Cotton T-Shirt",
    description: "100% organic cotton comfortable t-shirt",
    price: "29.99",
    categorySlug: "clothing",
    stockQuantity: 150,
    sku: "CLOTH-TSHIRT-001",
    imageUrl: "https://example.com/images/tshirt.jpg",
    isActive: true,
  },
  {
    name: "Denim Jeans",
    description: "Classic blue denim jeans with stretch fit",
    price: "59.99",
    categorySlug: "clothing",
    stockQuantity: 80,
    sku: "CLOTH-JEANS-002",
    imageUrl: "https://example.com/images/jeans.jpg",
    isActive: true,
  },
  {
    name: "Winter Jacket",
    description: "Waterproof insulated jacket for cold weather",
    price: "149.99",
    categorySlug: "clothing",
    stockQuantity: 35,
    sku: "CLOTH-JACKET-003",
    imageUrl: "https://example.com/images/jacket.jpg",
    isActive: true,
  },
  // Books
  {
    name: "JavaScript: The Definitive Guide",
    description: "Comprehensive guide to JavaScript programming",
    price: "49.99",
    categorySlug: "books",
    stockQuantity: 60,
    sku: "BOOK-JS-001",
    imageUrl: "https://example.com/images/js-book.jpg",
    isActive: true,
  },
  {
    name: "The Art of Computer Programming",
    description: "Classic computer science textbook series",
    price: "199.99",
    categorySlug: "books",
    stockQuantity: 25,
    sku: "BOOK-CS-002",
    imageUrl: "https://example.com/images/cs-book.jpg",
    isActive: true,
  },
  // Home & Garden
  {
    name: "LED Desk Lamp",
    description: "Adjustable brightness desk lamp with USB port",
    price: "39.99",
    categorySlug: "home-garden",
    stockQuantity: 90,
    sku: "HOME-LAMP-001",
    imageUrl: "https://example.com/images/desk-lamp.jpg",
    isActive: true,
  },
  {
    name: "Indoor Plant Pot Set",
    description: "Ceramic pots with drainage, set of 3",
    price: "34.99",
    categorySlug: "home-garden",
    stockQuantity: 75,
    sku: "HOME-POT-002",
    imageUrl: "https://example.com/images/plant-pots.jpg",
    isActive: true,
  },
  // Sports & Outdoors
  {
    name: "Yoga Mat",
    description: "Non-slip exercise mat with carrying strap",
    price: "29.99",
    categorySlug: "sports-outdoors",
    stockQuantity: 110,
    sku: "SPORT-YOGA-001",
    imageUrl: "https://example.com/images/yoga-mat.jpg",
    isActive: true,
  },
  {
    name: "Water Bottle",
    description: "Insulated stainless steel water bottle 32oz",
    price: "24.99",
    categorySlug: "sports-outdoors",
    stockQuantity: 140,
    sku: "SPORT-BOTTLE-002",
    imageUrl: "https://example.com/images/water-bottle.jpg",
    isActive: true,
  },
];

async function main() {
  logger.info("🌱 Starting database seeding...");

  // Clear existing data
  logger.info("🧹 Cleaning existing data...");
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Seed categories
  logger.info("📦 Seeding categories...");
  const createdCategories = {};
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    });
    createdCategories[category.slug] = created.id;
    logger.info(`✓ Created category: ${category.name}`);
  }

  // Seed products
  logger.info("📦 Seeding products...");
  for (const product of products) {
    const { categorySlug, ...productData } = product;
    await prisma.product.create({
      data: {
        ...productData,
        categoryId: createdCategories[categorySlug],
      },
    });
    logger.info(`✓ Created product: ${product.name}`);
  }

  logger.info("✅ Database seeding completed successfully!");
  logger.info(
    `📊 Created ${categories.length} categories and ${products.length} products`,
  );
}

main()
  .catch((error) => {
    logger.error({ err: error }, "❌ Seeding failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
