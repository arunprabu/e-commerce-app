import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useProducts } from "@/hooks/useProducts";
import { useProductOverlayStore } from "@/store/productOverlayStore";
import { server } from "@/test/msw/server";
import { mockProducts } from "@/test/msw/handlers";
import type { Product } from "@/types/product";

function makeProduct(id: number, title = `Product ${id}`): Product {
  return {
    id,
    title,
    price: 10,
    description: "desc",
    category: "test",
    image: "https://example.com/p.png",
    rating: { rate: 4, count: 10 },
  };
}

describe("useProducts (integration)", () => {
  it("loads products from the API", async () => {
    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(mockProducts.length);
    expect(result.current.error).toBeNull();
  });

  it("derives sorted, de-duplicated categories", async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.categories).toEqual(["jewelery", "men's clothing"]);
  });

  it("surfaces an error when the API fails", async () => {
    server.use(
      http.get("https://fakestoreapi.com/products", () =>
        new HttpResponse(null, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Could not load products. Please try again.");
    expect(result.current.products).toEqual([]);
  });

  it("merges locally-added products over API data", async () => {
    useProductOverlayStore.setState({
      added: [makeProduct(99, "Local product")],
      edited: {},
      deletedIds: [],
    });

    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products[0].title).toBe("Local product");
    expect(result.current.products).toHaveLength(mockProducts.length + 1);
  });

  it("hides products marked as deleted in the overlay", async () => {
    useProductOverlayStore.setState({
      added: [],
      edited: {},
      deletedIds: [mockProducts[0].id],
    });

    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products.map((p) => p.id)).not.toContain(mockProducts[0].id);
  });
});
