import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CartPage } from "@/pages/storefront/CartPage";
import { useCartStore } from "@/store/cartStore";
import { mockProducts } from "@/test/msw/handlers";

function renderCart() {
  return render(
    <MemoryRouter initialEntries={["/cart"]}>
      <Routes>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<h1>Checkout destination</h1>} />
        <Route path="/" element={<h1>Store home</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [
        { product: mockProducts[0], quantity: 2 },
        { product: mockProducts[1], quantity: 1 },
      ],
    });
  });

  it("shows line totals and grand total, updates quantities, and navigates to checkout", async () => {
    const user = userEvent.setup();
    renderCart();

    expect(
      screen.getByRole("heading", { name: "Your cart" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$219.90")).toBeInTheDocument();
    expect(screen.getByText("$914.90")).toBeInTheDocument();

    const backpackRow = screen
      .getByRole("link", {
        name: mockProducts[0].title,
      })
      .closest("div.rounded-lg");
    expect(backpackRow).not.toBeNull();
    const row = within(backpackRow as HTMLElement);
    const quantityButtons = row.getAllByRole("button");
    await user.click(quantityButtons[1]);
    expect(row.getByText("3")).toBeInTheDocument();
    expect(row.getByText("$329.85")).toBeInTheDocument();
    await user.click(row.getAllByRole("button")[0]);
    expect(row.getByText("2")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Proceed to checkout" }),
    );
    expect(
      screen.getByRole("heading", { name: "Checkout destination" }),
    ).toBeInTheDocument();
  });

  it("removes a line item and renders the empty-cart state with a home link", async () => {
    const user = userEvent.setup();
    renderCart();

    const braceletRow = screen
      .getByRole("link", { name: mockProducts[1].title })
      .closest("div.rounded-lg");
    expect(braceletRow).not.toBeNull();
    await user.click(
      within(braceletRow as HTMLElement).getAllByRole("button")[2],
    );
    expect(screen.queryByText(mockProducts[1].title)).not.toBeInTheDocument();

    const backpackRow = screen
      .getByRole("link", { name: mockProducts[0].title })
      .closest("div.rounded-lg");
    expect(backpackRow).not.toBeNull();
    await user.click(
      within(backpackRow as HTMLElement).getAllByRole("button")[0],
    );
    const remainingRow = screen
      .getByRole("link", { name: mockProducts[0].title })
      .closest("div.rounded-lg");
    expect(remainingRow).not.toBeNull();
    await user.click(
      within(remainingRow as HTMLElement).getAllByRole("button")[0],
    );

    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Continue shopping" }));
    expect(
      screen.getByRole("heading", { name: "Store home" }),
    ).toBeInTheDocument();
  });
});
