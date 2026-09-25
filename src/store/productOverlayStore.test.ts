import { beforeEach, describe, expect, it } from "vitest";
import { useProductOverlayStore } from "@/store/productOverlayStore";
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

describe("productOverlayStore", () => {
  beforeEach(() => {
    useProductOverlayStore.setState({ added: [], edited: {}, deletedIds: [] });
  });

  it("adds a product to the front of the added list", () => {
    useProductOverlayStore.getState().addProduct(makeProduct(1));
    useProductOverlayStore.getState().addProduct(makeProduct(2));
    expect(useProductOverlayStore.getState().added.map((p) => p.id)).toEqual([
      2, 1,
    ]);
  });

  it("edits a locally-added product in place", () => {
    useProductOverlayStore.getState().addProduct(makeProduct(1));
    useProductOverlayStore.getState().addProduct(makeProduct(2));
    useProductOverlayStore.getState().editProduct(1, makeProduct(1, "Edited"));
    const state = useProductOverlayStore.getState();
    expect(state.added.find((product) => product.id === 1)?.title).toBe(
      "Edited",
    );
    expect(state.edited).toEqual({});
  });

  it("records an edit for a base (API) product", () => {
    useProductOverlayStore
      .getState()
      .editProduct(5, makeProduct(5, "Edited 5"));
    expect(useProductOverlayStore.getState().edited[5].title).toBe("Edited 5");
  });

  it("removes a locally-added product on delete", () => {
    useProductOverlayStore.getState().addProduct(makeProduct(1));
    useProductOverlayStore.getState().addProduct(makeProduct(2));
    useProductOverlayStore.getState().deleteProduct(1);
    const state = useProductOverlayStore.getState();
    expect(state.added.map((product) => product.id)).toEqual([2]);
    expect(state.deletedIds).toEqual([]);
  });

  it("marks a base product as deleted and drops any pending edit", () => {
    useProductOverlayStore
      .getState()
      .editProduct(5, makeProduct(5, "Edited 5"));
    useProductOverlayStore.getState().deleteProduct(5);
    const state = useProductOverlayStore.getState();
    expect(state.deletedIds).toEqual([5]);
    expect(state.edited).toEqual({});
  });
});
