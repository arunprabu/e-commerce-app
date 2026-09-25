import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

function makeProduct(id: number, price = 10): Product {
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

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds a new item with the given quantity", () => {
    useCartStore.getState().addItem(makeProduct(1), 2);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("defaults quantity to 1", () => {
    useCartStore.getState().addItem(makeProduct(1));
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("increments quantity when adding an existing product", () => {
    useCartStore.getState().addItem(makeProduct(1), 1);
    useCartStore.getState().addItem(makeProduct(2), 2);
    useCartStore.getState().addItem(makeProduct(1), 3);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(items.find((item) => item.product.id === 1)?.quantity).toBe(4);
    expect(items.find((item) => item.product.id === 2)?.quantity).toBe(2);
  });

  it("removes an item by product id", () => {
    useCartStore.getState().addItem(makeProduct(1));
    useCartStore.getState().addItem(makeProduct(2));
    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items.map((i) => i.product.id)).toEqual([2]);
  });

  it("updates quantity for a product", () => {
    useCartStore.getState().addItem(makeProduct(1), 1);
    useCartStore.getState().setQuantity(1, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("leaves items unchanged when setting quantity for an unknown product", () => {
    useCartStore.getState().addItem(makeProduct(1), 2);
    useCartStore.getState().setQuantity(999, 5);
    expect(useCartStore.getState().items).toMatchObject([
      { product: { id: 1 }, quantity: 2 },
    ]);
  });

  it("removes the item when quantity is set to 0 or below", () => {
    useCartStore.getState().addItem(makeProduct(1), 2);
    useCartStore.getState().setQuantity(1, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem(makeProduct(1));
    useCartStore.getState().addItem(makeProduct(2));
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
