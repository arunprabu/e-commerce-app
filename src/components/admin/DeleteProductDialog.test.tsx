import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteProductDialog } from "@/components/admin/DeleteProductDialog";
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

function renderDialog(
  overrides: Partial<Parameters<typeof DeleteProductDialog>[0]> = {},
) {
  const props = {
    product,
    loading: false,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<DeleteProductDialog {...props} />);
  return props;
}

describe("DeleteProductDialog", () => {
  it("renders nothing when no product is selected", () => {
    renderDialog({ product: null });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the confirmation copy with the product title", () => {
    renderDialog();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Delete product" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete/),
    ).toHaveTextContent(
      `Are you sure you want to delete "${product.title}"? This cannot be undone.`,
    );
  });

  it("calls onConfirm when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the dialog is dismissed", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog();

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalled();
  });

  it("disables the delete button and shows progress while loading", () => {
    renderDialog({ loading: true });

    const button = screen.getByRole("button", { name: "Deleting..." });
    expect(button).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });
});
