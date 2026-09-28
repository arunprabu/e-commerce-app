import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useCartStore } from "@/store/cartStore";
import { renderWithRouter } from "@/test/render";

describe("StorefrontLayout", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders the header, nested route content, and footer", () => {
    renderWithRouter(
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<div>Storefront child</div>} />
        </Route>
      </Routes>,
    );

    expect(screen.getByRole("link", { name: "ShopEasy" })).toBeInTheDocument();
    expect(screen.getByText("Storefront child")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
