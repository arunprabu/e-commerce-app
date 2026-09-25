import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { HomePage } from "@/pages/storefront/HomePage";
import { renderWithRouter } from "@/test/render";
import { mockProducts } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";

describe("HomePage (integration)", () => {
  it("renders products fetched from the API", async () => {
    renderWithRouter(<HomePage />);

    expect(await screen.findByText(mockProducts[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
  });

  it("filters products by search query", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomePage />);

    await screen.findByText(mockProducts[0].title);
    await user.type(
      screen.getByPlaceholderText("Search products..."),
      "bracelet",
    );

    await waitFor(() =>
      expect(screen.queryByText(mockProducts[0].title)).not.toBeInTheDocument(),
    );
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomePage />);

    await screen.findByText(mockProducts[0].title);
    await user.type(screen.getByPlaceholderText("Search products..."), "zzzzz");

    expect(await screen.findByText("No products found.")).toBeInTheDocument();
  });

  it("combines category and case-insensitive, trimmed title filtering", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomePage />);

    await screen.findByText(mockProducts[0].title);
    await user.click(screen.getByRole("button", { name: "jewelery" }));
    await user.type(
      screen.getByPlaceholderText("Search products..."),
      "  GOLD ",
    );

    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
    expect(screen.queryByText(mockProducts[0].title)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    await user.clear(screen.getByPlaceholderText("Search products..."));
    expect(screen.getByText(mockProducts[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockProducts[1].title)).toBeInTheDocument();
  });

  it("shows the load error and retries successfully", async () => {
    server.use(
      http.get(
        "https://fakestoreapi.com/products",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    renderWithRouter(<HomePage />);

    expect(
      await screen.findByText("Could not load products. Please try again."),
    ).toBeInTheDocument();
    server.resetHandlers();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(mockProducts[0].title)).toBeInTheDocument();
  });
});
