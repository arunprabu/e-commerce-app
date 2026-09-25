import { describe, expect, it } from "vitest";
import { mergeProducts } from "@/lib/products";
import type { Product, ProductOverlay } from "@/types/product";

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

const emptyOverlay: ProductOverlay = { added: [], edited: {}, deletedIds: [] };

describe("mergeProducts", () => {
  it("returns base products unchanged with an empty overlay", () => {
    const base = [makeProduct(1), makeProduct(2)];
    expect(mergeProducts(base, emptyOverlay)).toEqual(base);
  });

  it("filters out deleted ids", () => {
    const base = [makeProduct(1), makeProduct(2)];
    const result = mergeProducts(base, { ...emptyOverlay, deletedIds: [1] });
    expect(result.map((p) => p.id)).toEqual([2]);
  });

  it("applies edits over base products", () => {
    const base = [makeProduct(1)];
    const edited = makeProduct(1, "Edited title");
    const result = mergeProducts(base, {
      ...emptyOverlay,
      edited: { 1: edited },
    });
    expect(result[0].title).toBe("Edited title");
  });

  it("keeps the original product when no edit exists for its id", () => {
    const original = makeProduct(1);
    const result = mergeProducts([original], {
      ...emptyOverlay,
      edited: { 2: makeProduct(2, "Other product") },
    });
    expect(result).toEqual([original]);
  });

  it("places added products before base products", () => {
    const base = [makeProduct(1)];
    const added = makeProduct(99, "New product");
    const result = mergeProducts(base, { ...emptyOverlay, added: [added] });
    expect(result.map((p) => p.id)).toEqual([99, 1]);
  });

  it("combines added, edited, and deleted in one pass", () => {
    const base = [makeProduct(1), makeProduct(2), makeProduct(3)];
    const result = mergeProducts(base, {
      added: [makeProduct(99)],
      edited: { 2: makeProduct(2, "Edited 2") },
      deletedIds: [3],
    });
    expect(result.map((p) => p.id)).toEqual([99, 1, 2]);
    expect(result.find((p) => p.id === 2)?.title).toBe("Edited 2");
  });
});
