import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProductDetailPage } from "@/pages/storefront/ProductDetailPage";
import { useCartStore } from "@/store/cartStore";

function renderProductDetail(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/" element={<h1>Store home</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProductDetailPage", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("shows loading placeholders while product data is being fetched", () => {
    const { container } = renderProductDetail("/product/1");

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it("shows product details, clamps decrement at one, and adds the selected quantity", async () => {
    const user = userEvent.setup();
    renderProductDetail("/product/1");

    expect(
      await screen.findByRole("heading", { name: "Fjallraven Backpack" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$109.95")).toBeInTheDocument();
    expect(screen.getByText("3.9 (120 reviews)")).toBeInTheDocument();

    const buttons = () => screen.getAllByRole("button");
    await user.click(buttons()[0]);
    expect(screen.getByText("1", { selector: "span" })).toBeInTheDocument();
    await user.click(buttons()[1]);
    await user.click(buttons()[1]);
    expect(screen.getByText("3", { selector: "span" })).toBeInTheDocument();

    await user.click(buttons()[2]);
    expect(useCartStore.getState().items).toMatchObject([
      { product: { id: 1 }, quantity: 3 },
    ]);
  });

  it("shows a not-found state for an unknown product id", async () => {
    renderProductDetail("/product/999");

    expect(await screen.findByText("Product not found")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("link", { name: "Back to products" }),
    );
    expect(
      screen.getByRole("heading", { name: "Store home" }),
    ).toBeInTheDocument();
  });
});
