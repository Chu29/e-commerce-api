import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// Mock controllers BEFORE importing routes
const mockCreateCategoryController = jest.fn();
const mockGetAllCategoriesController = jest.fn();

jest.unstable_mockModule("./category.controller.js", () => ({
  createCategoryController: mockCreateCategoryController,
  getAllCategoriesController: mockGetAllCategoriesController,
}));

// Import routes after mocking
const { default: categoryRoutes } = await import("./category.routes.js");

const app = express();
app.use(express.json());
app.use(categoryRoutes);

describe("Category Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /categories", () => {
    it("should call createCategoryController", async () => {
      mockCreateCategoryController.mockImplementation((req, res) => {
        return res.status(201).json({
          message: "Category created successfully",
          category: {
            id: 1,
            name: "Electronics",
          },
        });
      });

      const response = await request(app).post("/categories").send({
        name: "Electronics",
      });

      expect(mockCreateCategoryController).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Category created successfully",
        category: {
          id: 1,
          name: "Electronics",
        },
      });
    });
  });

  describe("GET /categories", () => {
    it("should call getAllCategoriesController", async () => {
      mockGetAllCategoriesController.mockImplementation((req, res) => {
        return res.status(200).json({
          message: "Categories retrieved successfully",
          categories: [
            {
              id: 1,
              name: "Electronics",
            },
            {
              id: 2,
              name: "Books",
            },
          ],
        });
      });

      const response = await request(app).get("/categories");

      expect(mockGetAllCategoriesController).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Categories retrieved successfully",
        categories: [
          {
            id: 1,
            name: "Electronics",
          },
          {
            id: 2,
            name: "Books",
          },
        ],
      });
    });
  });
});
