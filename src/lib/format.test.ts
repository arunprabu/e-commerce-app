import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats whole numbers as USD", () => {
    expect(formatPrice(695)).toBe("$695.00");
  });

  it("formats decimals with two fraction digits", () => {
    expect(formatPrice(109.95)).toBe("$109.95");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});
