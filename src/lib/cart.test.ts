import { describe, expect, it } from "vitest";
import { getCartCount, getCartTotal } from "@/lib/cart";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

function makeProduct(id: number, price: number): Product {
  return {
    id,
    title: `Product ${id}`,
    price,
    description: "desc",
    category: "test",
    image: "https://example.com/p.png",
    rating: { rate: 4, count: 10 },
  };
}

describe("getCartCount", () => {
  it("returns 0 for an empty cart", () => {
    expect(getCartCount([])).toBe(0);
  });

  it("sums quantities across items", () => {
    const items: CartItem[] = [
      { product: makeProduct(1, 10), quantity: 2 },
      { product: makeProduct(2, 5), quantity: 3 },
    ];
    expect(getCartCount(items)).toBe(5);
  });
});

describe("getCartTotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(getCartTotal([])).toBe(0);
  });

  it("multiplies price by quantity and sums", () => {
    const items: CartItem[] = [
      { product: makeProduct(1, 10), quantity: 2 },
      { product: makeProduct(2, 5.5), quantity: 3 },
    ];
    expect(getCartTotal(items)).toBeCloseTo(36.5);
  });
});
