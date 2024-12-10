const request = require("supertest");
const fs = require("node:fs/promises");
const app = require("./app");

jest.mock("node:fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe("E-Commerce Admin API", () => {
  const mockProducts = [
    {
      id: "p1",
      title: "Product 1",
      description: "Description 1",
      price: 10.0,
      product_type: "Electronics",
      published: true,
      inventory: 100,
    },
    {
      id: "p2",
      title: "Product 2",
      description: "Description 2",
      price: 20.0,
      product_type: "Books",
      published: false,
      inventory: 200,
    },
  ];

  const mockAdmin = {
    username: "admin@example.com",
    password: "hashed_password",
    discount_threshold: 300,
    discount_rate: 0.2,
  };

  describe("Products Endpoints", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockProducts));
    });

    test("GET /products/published - should retrieve all published products", async () => {
      const res = await request(app).get("/products/published");
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].id).toBe("p1");
    });

    test("GET /products/published?groupBy=product_type - should group published products by product_type", async () => {
      const res = await request(app).get(
        "/products/published?groupBy=product_type"
      );
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual({
        Electronics: [mockProducts[0]],
      });
    });

    test("GET /products/all - should retrieve all products", async () => {
      const res = await request(app).get("/products/all");
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
    });

    test("GET /products/all?groupBy=product_type - should group all products by product_type", async () => {
      const res = await request(app).get("/products/all?groupBy=product_type");
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual({
        Electronics: [mockProducts[0]],
        Books: [mockProducts[1]],
      });
    });

    test("PUT /products/:productId - should update a specific product", async () => {
      const updatedProduct = { ...mockProducts[0], inventory: 50 };

      const res = await request(app)
        .put("/products/p1")
        .send({ product: updatedProduct });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product updated!");

      const updatedProducts = mockProducts.map((p) =>
        p.id === "p1" ? { ...p, inventory: 50 } : p
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        "./data/products.json",
        JSON.stringify(updatedProducts)
      );
    });

    test("PUT /products/:productId - should return error for invalid product data", async () => {
      const res = await request(app).put("/products/p1").send({ product: {} });
      expect(res.status).toBe(422);
      expect(res.body.message).toBe(
        "Invalid product data, required fields: [id, title, description]"
      );
    });

    test("PUT /products/:productId - should not update inventory to undefined if not provided", async () => {
      const updatedProduct = { ...mockProducts[0], inventory: undefined };

      const res = await request(app)
        .put("/products/p1")
        .send({ product: updatedProduct });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product updated!");

      const updatedProducts = mockProducts.map((p) =>
        p.id === "p1" ? { ...p, inventory: 100 } : p
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        "./data/products.json",
        JSON.stringify(updatedProducts)
      );
    });
  });

  describe("Admin Endpoints", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockAdmin));
    });

    test("GET /admin - should retrieve admin settings", async () => {
      const res = await request(app).get("/admin");
      expect(res.status).toBe(200);
      expect(res.body.admin).toEqual(mockAdmin);
    });

    test("PUT /admin - should update admin settings", async () => {
      const updatedAdmin = { ...mockAdmin, discount_threshold: 500 };
      const res = await request(app)
        .put("/admin")
        .send({ admin: updatedAdmin });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Admin User updated!");

      expect(fs.writeFile).toHaveBeenCalledWith(
        "./data/admin.json",
        JSON.stringify(updatedAdmin)
      );
    });

    test("PUT /admin - should return error for invalid admin data", async () => {
      const res = await request(app).put("/admin").send({ admin: {} });
      expect(res.status).toBe(422);
      expect(res.body.message).toBe(
        "Invalid admin data, required fields: [username, password]"
      );
    });

    test("PUT /admin - should not update discount_rate to undefined if not provided", async () => {
      const updatedAdmin = { ...mockAdmin, discount_rate: undefined };
      const res = await request(app)
        .put("/admin")
        .send({ admin: updatedAdmin });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Admin User updated!");

      const expectedAdmin = { ...mockAdmin, discount_rate: 0.2 };
      expect(fs.writeFile).toHaveBeenCalledWith(
        "./data/admin.json",
        JSON.stringify(expectedAdmin)
      );
    });
  });

  describe("404 Handling", () => {
    test("GET /invalid-endpoint - should return 404", async () => {
      const res = await request(app).get("/invalid-endpoint");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("404 - Not Found");
    });
  });
});
