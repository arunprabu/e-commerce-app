import type { Product, ProductOverlay } from "@/types/product";

// Applies locally-stored admin changes on top of the products returned by the fake API.
export function mergeProducts(
  base: Product[],
  overlay: ProductOverlay,
): Product[] {
  const visible = base.filter((p) => !overlay.deletedIds.includes(p.id));
  const withEdits = visible.map((p) => overlay.edited[p.id] ?? p);
  return [...overlay.added, ...withEdits];
}
