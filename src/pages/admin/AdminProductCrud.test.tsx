import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";
import { useProductOverlayStore } from "@/store/productOverlayStore";
import { mockProducts } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

function renderAdmin(route = "/admin/products") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

async function fillProductForm(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) {
  await user.type(screen.getByLabelText("Title"), title);
  await user.type(screen.getByLabelText("Price (USD)"), "12.50");
  await user.type(screen.getByLabelText("Category"), "test category");
  await user.type(
    screen.getByLabelText("Image URL"),
    "https://example.com/product.png",
  );
  await user.type(
    screen.getByLabelText("Description"),
    "A test product description.",
  );
}

describe("admin product CRUD UI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: true });
    useProductOverlayStore.setState({ added: [], edited: {}, deletedIds: [] });
  });

  it("lists products, filters by title, and links to the create form", async () => {
    const user = userEvent.setup();
    renderAdmin();

    expect(await screen.findByText(mockProducts[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText("Search products..."),
      "bracelet",
    );

    expect(screen.queryByText(mockProducts[0].title)).not.toBeInTheDocument();
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Add product" }));
    expect(
      await screen.findByRole("heading", { name: "Add product" }),
    ).toBeInTheDocument();
  });

  it("renders an empty search result", async () => {
    const user = userEvent.setup();
    renderAdmin();

    await screen.findByText(mockProducts[0].title);
    await user.type(
      screen.getByPlaceholderText("Search products..."),
      "missing",
    );
    expect(await screen.findByText("No products found.")).toBeInTheDocument();
  });

  it("shows a load error and retries the product list", async () => {
    server.use(
      http.get(
        "https://fakestoreapi.com/products",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    renderAdmin();

    expect(
      await screen.findByText("Could not load products. Please try again."),
    ).toBeInTheDocument();
    server.resetHandlers();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(mockProducts[0].title)).toBeInTheDocument();
  });

  it("shows validation errors and creates a product in the local overlay", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/products/new");

    await user.click(
      await screen.findByRole("button", { name: "Create product" }),
    );
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Enter a price greater than 0."),
    ).toBeInTheDocument();
    expect(screen.getByText("Category is required.")).toBeInTheDocument();
    expect(screen.getByText("Image URL is required.")).toBeInTheDocument();
    expect(screen.getByText("Description is required.")).toBeInTheDocument();

    const categoryInput = screen.getByLabelText("Category");
    await user.click(screen.getByText("jewelery"));
    expect(categoryInput).toHaveValue("jewelery");
    await user.clear(categoryInput);
    await fillProductForm(user, "Test admin product");
    fireEvent.error(screen.getByAltText("Preview"));
    expect(screen.getByAltText("Preview")).toHaveStyle({
      visibility: "hidden",
    });
    fireEvent.load(screen.getByAltText("Preview"));
    expect(screen.getByAltText("Preview")).toHaveStyle({
      visibility: "visible",
    });
    await user.click(screen.getByRole("button", { name: "Create product" }));

    expect(
      await screen.findByRole("heading", { name: "Products" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Test admin product")).toBeInTheDocument();
    const created = useProductOverlayStore.getState().added[0];
    expect(created).toMatchObject({
      title: "Test admin product",
      price: 12.5,
      category: "test category",
      rating: { rate: 0, count: 0 },
    });
    expect(created.id).toEqual(expect.any(Number));
  });

  it("pre-fills, edits, and stores the updated product in the overlay", async () => {
    const user = userEvent.setup();
    renderAdmin("/admin/products/1/edit");

    const titleInput = await screen.findByDisplayValue(mockProducts[0].title);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated backpack title");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText("Updated backpack title"),
    ).toBeInTheDocument();
    expect(useProductOverlayStore.getState().edited[1]).toMatchObject({
      ...mockProducts[0],
      title: "Updated backpack title",
    });
  });

  it("submits create and update requests and reports API failures", async () => {
    const user = userEvent.setup();
    const toastError = vi
      .spyOn(toast, "error")
      .mockImplementation(() => "toast-id");
    server.use(
      http.post("https://fakestoreapi.com/products", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    const { unmount } = renderAdmin("/admin/products/new");
    await fillProductForm(user, "Failed create");
    await user.click(
      await screen.findByRole("button", { name: "Create product" }),
    );
    expect(toastError).toHaveBeenCalledWith("Could not create product.");
    expect(
      screen.getByRole("button", { name: "Create product" }),
    ).toBeEnabled();
    unmount();

    server.use(
      http.put("https://fakestoreapi.com/products/:id", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    renderAdmin("/admin/products/1/edit");
    await screen.findByDisplayValue(mockProducts[0].title);
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(toastError).toHaveBeenCalledWith("Could not update product.");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("confirms deletion and removes the product from the list and overlay", async () => {
    const user = userEvent.setup();
    renderAdmin();

    const productRow = await screen.findByRole("row", {
      name: new RegExp(mockProducts[0].title),
    });
    await user.click(within(productRow).getByRole("button"));
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      mockProducts[0].title,
    );
    let finishDelete: (() => void) | undefined;
    server.use(
      http.delete("https://fakestoreapi.com/products/:id", async () => {
        await new Promise<void>((resolve) => {
          finishDelete = resolve;
        });
        return new HttpResponse(null, { status: 200 });
      }),
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    const deletingButton = await screen.findByRole("button", {
      name: "Deleting...",
    });
    expect(deletingButton).toBeDisabled();
    finishDelete?.();

    await waitFor(() =>
      expect(useProductOverlayStore.getState().deletedIds).toContain(
        mockProducts[0].id,
      ),
    );
    expect(
      screen.queryByRole("row", { name: new RegExp(mockProducts[0].title) }),
    ).not.toBeInTheDocument();
  });

  it("cancels deletion and keeps the product when the delete request fails", async () => {
    const user = userEvent.setup();
    renderAdmin();

    const productRow = await screen.findByRole("row", {
      name: new RegExp(mockProducts[0].title),
    });
    await user.click(within(productRow).getByRole("button"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(within(productRow).getByRole("button"));
    server.use(
      http.delete(
        "https://fakestoreapi.com/products/:id",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const toastError = vi
      .spyOn(toast, "error")
      .mockImplementation(() => "toast-id");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(toastError).toHaveBeenCalledWith(
      "Could not delete product. Please try again.",
    );
    expect(screen.getByText(mockProducts[0].title)).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown edit id", async () => {
    renderAdmin("/admin/products/999/edit");

    expect(await screen.findByText("Product not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to products" }),
    ).toHaveAttribute("href", "/admin/products");
  });
});
