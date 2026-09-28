import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthStore } from "@/store/authStore";
import { renderWithRouter } from "@/test/render";

function renderAdminLayout(route = "/admin/products") {
  return renderWithRouter(
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin/products" element={<div>Admin child</div>} />
      </Route>
      <Route path="/admin/login" element={<div>Login page</div>} />
    </Routes>,
    { route },
  );
}

describe("AdminLayout", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: true });
  });

  it("renders the admin chrome and the nested route content", () => {
    renderAdminLayout();

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "href",
      "/admin/products",
    );
    expect(screen.getByRole("link", { name: "View store" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText("Admin child")).toBeInTheDocument();
  });

  it("logs out and navigates to the login page", async () => {
    const user = userEvent.setup();
    renderAdminLayout();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });
});
