import { http, HttpResponse } from "msw";
import type { Product } from "@/types/product";

const BASE_URL = "https://fakestoreapi.com";

// A small, deterministic catalog so tests don't depend on the live fake API.
export const mockProducts: Product[] = [
  {
    id: 1,
    title: "Fjallraven Backpack",
    price: 109.95,
    description: "Your perfect pack for everyday use.",
    category: "men's clothing",
    image: "https://example.com/backpack.png",
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 2,
    title: "Gold Chain Bracelet",
    price: 695,
    description: "Satisfaction guaranteed.",
    category: "jewelery",
    image: "https://example.com/bracelet.png",
    rating: { rate: 4.6, count: 400 },
  },
];

export const handlers = [
  http.get(`${BASE_URL}/products`, () => HttpResponse.json(mockProducts)),

  http.post(`${BASE_URL}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...body, id: 21, rating: { rate: 0, count: 0 } });
  }),

  http.put(`${BASE_URL}/products/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...body,
      id: Number(params.id),
      rating: { rate: 0, count: 0 },
    });
  }),

  http.delete(`${BASE_URL}/products/:id`, () => new HttpResponse(null, { status: 200 })),
];
