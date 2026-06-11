import request from "supertest";
import { app } from "../../../../app.js";
import { disconnectDB, prisma } from "../../../config/db.js";

const unique = Date.now();
const testPrefix = `jest-product-${unique}`;
const missingId = 2147483647;
let category;
let otherCategory;
let product;
let otherProduct;

const productPayload = (overrides = {}) => ({
  name: `${testPrefix}-phone`,
  description: "A seeded test phone",
  price: 199.99,
  categoryId: category.id,
  stockQuantity: 12,
  ...overrides,
});

beforeAll(async () => {
  category = await prisma.category.create({
    data: {
      name: `${testPrefix}-electronics`,
      description: "Products created by the product route test suite",
      slug: `${testPrefix}-electronics`,
    },
  });

  otherCategory = await prisma.category.create({
    data: {
      name: `${testPrefix}-books`,
      description: "Second category for filter assertions",
      slug: `${testPrefix}-books`,
    },
  });

  product = await prisma.product.create({
    data: {
      name: `${testPrefix}-laptop`,
      description: "Searchable laptop",
      price: 999.99,
      categoryId: category.id,
      stockQuantity: 5,
      sku: `${testPrefix}-laptop-sku`,
    },
  });

  otherProduct = await prisma.product.create({
    data: {
      name: `${testPrefix}-novel`,
      description: "Book product in another category",
      price: 24.99,
      categoryId: otherCategory.id,
      stockQuantity: 20,
      sku: `${testPrefix}-novel-sku`,
    },
  });
});

afterAll(async () => {
  await prisma.product.deleteMany({
    where: {
      OR: [
        { name: { startsWith: testPrefix } },
        { sku: { startsWith: testPrefix } },
      ],
    },
  });
  await prisma.category.deleteMany({
    where: { slug: { startsWith: testPrefix } },
  });
  await disconnectDB();
});

describe("product routes", () => {
  it("lists products with categories", async () => {
    const response = await request(app).get("/api/products").expect(200);

    expect(Array.isArray(response.body.products)).toBe(true);
    expect(response.body.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: product.id,
          category: expect.objectContaining({ id: category.id }),
        }),
      ]),
    );
  });

  it("gets a product by id", async () => {
    const response = await request(app)
      .get(`/api/products/${product.id}`)
      .expect(200);

    expect(response.body.message).toBe("Product retrieved successfully");
    expect(response.body.product).toEqual(
      expect.objectContaining({
        id: product.id,
        name: product.name,
        category: expect.objectContaining({ id: category.id }),
      }),
    );
  });

  it("returns 404 for a missing product", async () => {
    const response = await request(app)
      .get(`/api/products/${missingId}`)
      .expect(404);

    expect(response.body.error).toBe("Product not found");
  });

  it("returns 400 for an invalid product id", async () => {
    const response = await request(app).get("/api/products/not-a-number").expect(400);

    expect(response.body.error).toBe("Invalid product ID");
  });

  it("searches and filters products by category", async () => {
    const response = await request(app)
      .get("/api/products/search")
      .query({ categoryId: category.id, limit: 10 })
      .expect(200);

    expect(response.body.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: product.id, categoryId: category.id }),
      ]),
    );
    expect(response.body.products).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: otherProduct.id })]),
    );
    expect(response.body.pagination).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        totalPages: expect.any(Number),
      }),
    );
  });

  it("creates a product", async () => {
    const response = await request(app)
      .post("/api/products")
      .send(productPayload({ name: `${testPrefix}-tablet` }))
      .expect(201);

    expect(response.body.message).toBe("Product created successfully");
    expect(response.body.product).toEqual(
      expect.objectContaining({
        name: `${testPrefix}-tablet`,
        categoryId: category.id,
        stockQuantity: 12,
      }),
    );
    expect(response.body.product.sku).toMatch(/^JES-/);
  });

  it("returns 400 when creating with invalid product data", async () => {
    const response = await request(app)
      .post("/api/products")
      .send(productPayload({ price: -1 }))
      .expect(400);

    expect(response.body.error).toBe("Invalid product data");
  });

  it("returns 404 when creating with a missing category", async () => {
    const response = await request(app)
      .post("/api/products")
      .send(productPayload({ categoryId: missingId }))
      .expect(404);

    expect(response.body.error).toBe("Category not found");
  });

  it("updates a product", async () => {
    const response = await request(app)
      .patch(`/api/products/${product.id}`)
      .send({ price: 879.5, stockQuantity: 8 })
      .expect(200);

    expect(response.body.message).toBe("Product updated successfully");
    expect(response.body.product).toEqual(
      expect.objectContaining({
        id: product.id,
        price: "879.5",
        stockQuantity: 8,
      }),
    );
  });

  it("returns 404 when updating a missing product", async () => {
    const response = await request(app)
      .patch(`/api/products/${missingId}`)
      .send({ price: 10 })
      .expect(404);

    expect(response.body.error).toBe("Product not found");
  });

  it("deletes a product", async () => {
    const productToDelete = await prisma.product.create({
      data: {
        name: `${testPrefix}-delete-me`,
        description: "Temporary delete target",
        price: 49.99,
        categoryId: category.id,
        sku: `${testPrefix}-delete-me-sku`,
      },
    });

    const response = await request(app)
      .delete(`/api/products/${productToDelete.id}`)
      .expect(200);

    expect(response.body.message).toBe("Product deleted successfully");
    expect(response.body.product.id).toBe(productToDelete.id);
  });

  it("returns 404 when deleting a missing product", async () => {
    const response = await request(app)
      .delete(`/api/products/${missingId}`)
      .expect(404);

    expect(response.body.error).toBe("Product not found");
  });
});
