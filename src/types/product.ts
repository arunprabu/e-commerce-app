export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

// Fields an admin fills in; id is assigned by us and rating starts neutral.
export type ProductInput = Omit<Product, "id" | "rating">;

// Local, persisted changes layered on top of the read-only fake API data.
export interface ProductOverlay {
  added: Product[];
  edited: Record<number, Product>;
  deletedIds: number[];
}
