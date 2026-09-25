import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";

describe("App", () => {
  it("mounts the storefront inside the application router", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Shop all products" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cart/i })).toBeInTheDocument();
  });
});
