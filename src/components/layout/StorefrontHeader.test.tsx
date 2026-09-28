import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { StorefrontHeader } from "@/components/layout/StorefrontHeader";
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

describe("StorefrontHeader", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders the brand and cart links", () => {
    renderWithRouter(<StorefrontHeader />);

    expect(screen.getByRole("link", { name: "ShopEasy" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute(
      "href",
      "/cart",
    );
  });

  it("hides the badge when the cart is empty", () => {
    renderWithRouter(<StorefrontHeader />);

    expect(screen.getByRole("link", { name: "Cart" })).not.toHaveTextContent(
      "0",
    );
  });

  it("shows the total item count in the badge", () => {
    useCartStore.setState({
      items: [
        { product: makeProduct(1), quantity: 2 },
        { product: makeProduct(2), quantity: 3 },
      ],
    });

    renderWithRouter(<StorefrontHeader />);

    expect(screen.getByRole("link", { name: /cart/i })).toHaveTextContent("5");
  });
});
