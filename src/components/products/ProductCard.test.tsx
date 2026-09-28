import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ProductCard } from "@/components/products/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { renderWithRouter } from "@/test/render";
import type { Product } from "@/types/product";

const product: Product = {
  id: 1,
  title: "Fjallraven Backpack",
  price: 109.95,
  description: "Your perfect pack for everyday use.",
  category: "men's clothing",
  image: "https://example.com/backpack.png",
  rating: { rate: 3.9, count: 120 },
};

describe("ProductCard", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the product details and links to its detail page", () => {
    renderWithRouter(<ProductCard product={product} />);

    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute(
      "src",
      product.image,
    );
    expect(screen.getByText(product.category)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: product.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3\.9 \(120\)/)).toBeInTheDocument();
    expect(screen.getByText("$109.95")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/product/${product.id}`,
    );
  });

  it("adds the product to the cart and shows a toast", async () => {
    const user = userEvent.setup();
    const toastSuccess = vi
      .spyOn(toast, "success")
      .mockImplementation(() => "toast-id");
    renderWithRouter(<ProductCard product={product} />);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toMatchObject({
      product,
      quantity: 1,
    });
    expect(toastSuccess).toHaveBeenCalledWith("Added to cart", {
      description: product.title,
    });
  });
});
