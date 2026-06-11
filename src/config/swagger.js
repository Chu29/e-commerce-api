import swaggerJSDoc from "swagger-jsdoc";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000/api";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the E-Commerce application",
    },
    servers: [
      {
        url: API_BASE_URL,
        description: "Local development server",
      },
      {
        url: "https://e-commerce-api-mv92.onrender.com/api",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        Category: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Electronics",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Category for electronic products",
            },
            slug: {
              type: "string",
              example: "electronics",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00.000Z",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "iPhone 15 Pro Max",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Latest iPhone model with advanced features.",
            },
            price: {
              type: "string",
              description: "Product price",
              example: "999.99",
            },
            categoryId: {
              type: "integer",
              nullable: true,
              example: 1,
            },
            stockQuantity: {
              type: "integer",
              example: 50,
            },
            sku: {
              type: "string",
              nullable: true,
              example: "ELE-A1B2C3",
            },
            imageUrl: {
              type: "string",
              nullable: true,
              example:
                "https://res.cloudinary.com/example/image/upload/v1/e-commerce/products/product_1.jpg",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-01T00:00:00.000Z",
            },
            category: {
              $ref: "#/components/schemas/Category",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            total: {
              type: "integer",
              example: 50,
            },
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 10,
            },
            totalPages: {
              type: "integer",
              example: 5,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "An error occurred",
            },
          },
        },
        CreateCategoryRequest: {
          type: "object",
          required: ["name", "slug"],
          properties: {
            name: {
              type: "string",
              example: "Electronics",
            },
            description: {
              type: "string",
              example: "Category for electronic products",
            },
            slug: {
              type: "string",
              example: "electronics",
            },
          },
        },
        CreateProductRequest: {
          type: "object",
          required: ["name", "price", "categoryId"],
          properties: {
            name: {
              type: "string",
              example: "iPhone 15 Pro Max",
            },
            description: {
              type: "string",
              example: "Latest iPhone model with advanced features.",
            },
            price: {
              type: "string",
              example: "999.99",
            },
            categoryId: {
              type: "integer",
              example: 1,
            },
            stockQuantity: {
              type: "integer",
              example: 50,
            },
          },
        },
        UpdateProductRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "iPhone 15 Pro Max (Updated)",
            },
            description: {
              type: "string",
              example: "Updated description.",
            },
            price: {
              type: "string",
              example: "899.99",
            },
            categoryId: {
              type: "integer",
              example: 1,
            },
            stockQuantity: {
              type: "integer",
              example: 75,
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Categories",
        description: "Endpoints for managing categories",
      },
      {
        name: "Products",
        description: "Endpoints for managing products",
      },
      {
        name: "Product Images",
        description: "Endpoints for managing product images",
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
