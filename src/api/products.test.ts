import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  createProductRequest,
  deleteProductRequest,
  fetchProducts,
  updateProductRequest,
} from "@/api/products";
import { server } from "@/test/msw/server";
import { mockProducts } from "@/test/msw/handlers";
import type { ProductInput } from "@/types/product";

const BASE_URL = "https://fakestoreapi.com";
const input: ProductInput = {
  title: "Test product",
  price: 12,
  category: "test",
  description: "Product description",
  image: "https://example.com/product.png",
};

describe("product API", () => {
  it("fetches products and rejects unsuccessful responses", async () => {
    await expect(fetchProducts()).resolves.toEqual(mockProducts);
    server.use(
      http.get(`${BASE_URL}/products`, () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    await expect(fetchProducts()).rejects.toThrow("Could not load products.");
  });

  it("creates a product and rejects unsuccessful responses", async () => {
    await expect(createProductRequest(input)).resolves.toMatchObject(input);
    server.use(
      http.post(`${BASE_URL}/products`, () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    await expect(createProductRequest(input)).rejects.toThrow(
      "Could not create product.",
    );
  });

  it("updates a product and rejects unsuccessful responses", async () => {
    await expect(updateProductRequest(1, input)).resolves.toMatchObject({
      ...input,
      id: 1,
    });
    server.use(
      http.put(`${BASE_URL}/products/:id`, () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    await expect(updateProductRequest(1, input)).rejects.toThrow(
      "Could not update product.",
    );
  });

  it("deletes a product and rejects unsuccessful responses", async () => {
    await expect(deleteProductRequest(1)).resolves.toBeUndefined();
    server.use(
      http.delete(
        `${BASE_URL}/products/:id`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    await expect(deleteProductRequest(1)).rejects.toThrow(
      "Could not delete product.",
    );
  });
});
