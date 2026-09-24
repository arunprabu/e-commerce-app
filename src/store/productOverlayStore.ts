import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductOverlay } from "@/types/product";

interface ProductOverlayState extends ProductOverlay {
  addProduct: (product: Product) => void;
  editProduct: (id: number, product: Product) => void;
  deleteProduct: (id: number) => void;
}

export const useProductOverlayStore = create<ProductOverlayState>()(
  persist(
    (set) => ({
      added: [],
      edited: {},
      deletedIds: [],
      addProduct: (product) =>
        set((state) => ({ added: [product, ...state.added] })),
      editProduct: (id, product) =>
        set((state) =>
          state.added.some((p) => p.id === id)
            ? { added: state.added.map((p) => (p.id === id ? product : p)) }
            : { edited: { ...state.edited, [id]: product } },
        ),
      deleteProduct: (id) =>
        set((state) => {
          if (state.added.some((p) => p.id === id)) {
            return { added: state.added.filter((p) => p.id !== id) };
          }
          const restEdited = { ...state.edited };
          delete restEdited[id];
          return { edited: restEdited, deletedIds: [...state.deletedIds, id] };
        }),
    }),
    { name: "product-overlay-storage" },
  ),
);
