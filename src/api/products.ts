import type { Product, ProductInput } from "@/types/product";

const BASE_URL = "https://fakestoreapi.com";

async function parseOrThrow<T>(res: Response, message: string): Promise<T> {
  if (!res.ok) throw new Error(message);
  return res.json() as Promise<T>;
}

export function fetchProducts(): Promise<Product[]> {
  return fetch(`${BASE_URL}/products`).then((res) =>
    parseOrThrow<Product[]>(res, "Could not load products."),
  );
}

// fakestoreapi simulates these responses but never persists them server-side.
export function createProductRequest(data: ProductInput): Promise<Product> {
  return fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => parseOrThrow<Product>(res, "Could not create product."));
}

export function updateProductRequest(
  id: number,
  data: ProductInput,
): Promise<Product> {
  return fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => parseOrThrow<Product>(res, "Could not update product."));
}

export function deleteProductRequest(id: number): Promise<void> {
  return fetch(`${BASE_URL}/products/${id}`, { method: "DELETE" }).then(
    (res) => {
      if (!res.ok) throw new Error("Could not delete product.");
    },
  );
}
