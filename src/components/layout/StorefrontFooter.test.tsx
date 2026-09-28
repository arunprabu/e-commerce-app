import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { StorefrontFooter } from "@/components/layout/StorefrontFooter";
import { renderWithRouter } from "@/test/render";

describe("StorefrontFooter", () => {
  it("renders the copyright notice with the current year", () => {
    renderWithRouter(<StorefrontFooter />);

    const year = new Date().getFullYear();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      `© ${year} ShopEasy — demo store`,
    );
  });

  it("links to the admin login page", () => {
    renderWithRouter(<StorefrontFooter />);

    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute(
      "href",
      "/admin/login",
    );
  });
});
