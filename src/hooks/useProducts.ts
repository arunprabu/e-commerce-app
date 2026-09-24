import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "@/api/products";
import { useProductOverlayStore } from "@/store/productOverlayStore";
import { mergeProducts } from "@/lib/products";
import type { Product } from "@/types/product";

// Fetches the base catalog once and layers locally-persisted admin changes on top.
export function useProducts() {
  const [base, setBase] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const added = useProductOverlayStore((s) => s.added);
  const edited = useProductOverlayStore((s) => s.edited);
  const deletedIds = useProductOverlayStore((s) => s.deletedIds);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then(setBase)
      .catch(() => setError("Could not load products. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const products = useMemo(
    () => mergeProducts(base, { added, edited, deletedIds }),
    [base, added, edited, deletedIds],
  );

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products],
  );

  return { products, categories, loading, error, refetch: load };
}
