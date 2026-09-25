import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";
import { useProductOverlayStore } from "@/store/productOverlayStore";

function renderRoutes(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("AppRoutes and admin authentication", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
    useProductOverlayStore.setState({ added: [], edited: {}, deletedIds: [] });
  });

  it("shows the login page without storefront or admin layout chrome", () => {
    renderRoutes("/admin/login");

    expect(screen.getByText("Admin login")).toBeInTheDocument();
    expect(screen.queryByText("ShopEasy")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
  });

  it("rejects invalid credentials and logs in with the demo credentials", async () => {
    const user = userEvent.setup();
    renderRoutes("/admin/login");

    await user.type(screen.getByLabelText("Username"), "wrong");
    await user.type(screen.getByLabelText("Password"), "credentials");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(
      await screen.findByText("Invalid username or password."),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Username"));
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByRole("heading", { name: "Products" }),
    ).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it.each([
    "/admin",
    "/admin/products",
    "/admin/products/new",
    "/admin/products/1/edit",
  ])("redirects unauthenticated access to %s to login", async (route) => {
    renderRoutes(route);

    expect(await screen.findByText("Admin login")).toBeInTheDocument();
  });

  it("redirects an authenticated user from login and /admin to the products page", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    const { unmount } = renderRoutes("/admin/login");

    expect(
      await screen.findByRole("heading", { name: "Products" }),
    ).toBeInTheDocument();
    unmount();

    renderRoutes("/admin");
    expect(
      await screen.findByRole("heading", { name: "Products" }),
    ).toBeInTheDocument();
  });

  it("logs out and returns to the login page", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ isAuthenticated: true });
    renderRoutes("/admin/products");

    await user.click(await screen.findByRole("button", { name: "Log out" }));

    expect(await screen.findByText("Admin login")).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("renders the storefront layout on the home route", async () => {
    const user = userEvent.setup();
    renderRoutes("/");

    expect(
      await screen.findByRole("heading", { name: "Shop all products" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ShopEasy")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("demo store");
    expect(screen.getByRole("link", { name: "Cart" })).not.toHaveTextContent(
      "1",
    );
    await user.click(screen.getAllByRole("button", { name: "Add to cart" })[0]);
    expect(screen.getByRole("link", { name: /cart/i })).toHaveTextContent("1");
  });

  it("renders the standalone 404 page for an unknown route", () => {
    renderRoutes("/unknown-route");

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByText("Page not found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByText("ShopEasy")).not.toBeInTheDocument();
  });
});
