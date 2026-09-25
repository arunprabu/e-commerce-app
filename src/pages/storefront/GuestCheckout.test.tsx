import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CheckoutPage } from "@/pages/storefront/CheckoutPage";
import { OrderConfirmationPage } from "@/pages/storefront/OrderConfirmationPage";
import { useCartStore } from "@/store/cartStore";
import { mockProducts } from "@/test/msw/handlers";

function renderCheckout(route = "/checkout") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/cart" element={<h1>Cart page</h1>} />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmationPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("guest checkout", () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [
        { product: mockProducts[0], quantity: 2 },
        { product: mockProducts[1], quantity: 1 },
      ],
    });
  });

  it("shows the cart items, total, and guest checkout notice", () => {
    renderCheckout();

    expect(screen.getByRole("heading", { name: "Checkout" })).toBeInTheDocument();
    expect(screen.getByText("Fjallraven Backpack × 2")).toBeInTheDocument();
    expect(screen.getByText("Gold Chain Bracelet × 1")).toBeInTheDocument();
    expect(screen.getByText("$914.90")).toBeInTheDocument();
    expect(
      screen.getByText(/no account or payment details are required/i),
    ).toBeInTheDocument();
  });

  it("places the order, clears the cart, and shows the confirmation", async () => {
    const user = userEvent.setup();
    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Place order" }));

    expect(
      await screen.findByRole("heading", { name: "Thank you for your order!" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^ORD-\d+$/)).toBeInTheDocument();
    expect(screen.getByText("Fjallraven Backpack × 2")).toBeInTheDocument();
    expect(screen.getByText("Gold Chain Bracelet × 1")).toBeInTheDocument();
    expect(screen.getByText("$914.90")).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("redirects to the cart when checkout is opened with no items", async () => {
    useCartStore.setState({ items: [] });
    renderCheckout();

    expect(await screen.findByRole("heading", { name: "Cart page" })).toBeInTheDocument();
  });

  it("keeps the order id but hides order details when confirmation has no navigation state", () => {
    renderCheckout("/order-confirmation/ORD-123");

    expect(
      screen.getByRole("heading", { name: "Thank you for your order!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ORD-123")).toBeInTheDocument();
    expect(screen.queryByText("Fjallraven Backpack × 2")).not.toBeInTheDocument();
  });
});