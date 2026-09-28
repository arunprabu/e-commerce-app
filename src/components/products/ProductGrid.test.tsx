import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { useCartStore } from "@/store/cartStore";
import { renderWithRouter } from "@/test/render";
import type { Product } from "@/types/product";

function makeProduct(id: number): Product {
  return {
    id,
    title: `Product ${id}`,
    price: 10,
    description: "desc",
    category: "test",
    image: "https://example.com/p.png",
    rating: { rate: 4, count: 10 },
  };
}

describe("ProductGrid", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders a card for each product", () => {
    renderWithRouter(
      <ProductGrid products={[makeProduct(1), makeProduct(2)]} />,
    );

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add to cart" })).toHaveLength(
      2,
    );
  });

  it("renders nothing when there are no products", () => {
    renderWithRouter(<ProductGrid products={[]} />);

    expect(
      screen.queryByRole("button", { name: "Add to cart" }),
    ).not.toBeInTheDocument();
  });
});
