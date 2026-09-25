import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { useProductOverlayStore } from "@/store/productOverlayStore";
import { mockProducts } from "@/test/msw/handlers";

vi.mock("@/components/admin/DeleteProductDialog", () => ({
  DeleteProductDialog: ({ onConfirm }: { onConfirm: () => void }) => (
    <button onClick={onConfirm}>Confirm without selection</button>
  ),
}));

describe("AdminProductsPage deletion guard", () => {
  beforeEach(() => {
    useProductOverlayStore.setState({ added: [], edited: {}, deletedIds: [] });
  });

  it("does nothing when confirmation runs without a selected product", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(mockProducts[0].title)).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Confirm without selection" }),
    );

    expect(screen.getByText(mockProducts[0].title)).toBeInTheDocument();
    expect(useProductOverlayStore.getState().deletedIds).toEqual([]);
  });
});
