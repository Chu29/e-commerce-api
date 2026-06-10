import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// Mock middleware and controllers
const mockUploadMiddleware = jest.fn((req, res, next) => next());
const mockUploadProductImage = jest.fn();
const mockDeleteProductImage = jest.fn();

jest.unstable_mockModule("./image.controller.js", () => ({
  uploadMiddleware: mockUploadMiddleware,
  uploadProductImage: mockUploadProductImage,
  deleteProductImage: mockDeleteProductImage,
}));

const { default: imageRoutes } = await import("./image.routes.js");

const app = express();
app.use(express.json());
app.use(imageRoutes);

describe("Image Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /product/:id/image", () => {
    it("should execute uploadMiddleware and uploadProductImage", async () => {
      mockUploadProductImage.mockImplementation((req, res) => {
        return res.status(200).json({
          message: "Image updated successfully",
          imageUrl: "https://example.com/products/product_1.jpg",
          product: {
            id: 1,
            name: "Laptop",
          },
        });
      });

      const response = await request(app).post("/product/1/image");

      expect(mockUploadMiddleware).toHaveBeenCalledTimes(1);
      expect(mockUploadProductImage).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Image updated successfully",
        imageUrl: "https://example.com/products/product_1.jpg",
        product: {
          id: 1,
          name: "Laptop",
        },
      });
    });

    it("should pass the product id to the controller", async () => {
      mockUploadProductImage.mockImplementation((req, res) => {
        return res.status(200).json({
          productId: req.params.id,
        });
      });

      const response = await request(app).post("/product/123/image");

      expect(response.status).toBe(200);
      expect(response.body.productId).toBe("123");
    });
  });

  describe("DELETE /product/:id/image", () => {
    it("should call deleteProductImage", async () => {
      mockDeleteProductImage.mockImplementation((req, res) => {
        return res.status(200).json({
          message: "Image deleted successfully",
          product: {
            id: 1,
            name: "Laptop",
          },
        });
      });

      const response = await request(app).delete("/product/1/image");

      expect(mockDeleteProductImage).toHaveBeenCalledTimes(1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Image deleted successfully",
        product: {
          id: 1,
          name: "Laptop",
        },
      });
    });

    it("should pass the product id to the delete controller", async () => {
      mockDeleteProductImage.mockImplementation((req, res) => {
        return res.status(200).json({
          productId: req.params.id,
        });
      });

      const response = await request(app).delete("/product/456/image");

      expect(response.status).toBe(200);
      expect(response.body.productId).toBe("456");
    });
  });
});
