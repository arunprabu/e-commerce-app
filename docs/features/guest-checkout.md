# Feature: Guest Checkout

**Status:** Implemented (demo-scope)
**Last updated:** 2026-09-25

## Summary

Guest checkout lets a shopper place an order without creating an account, logging in, or
entering any payment details. It is a fully client-side simulation: the cart is read from the
zustand cart store, an `Order` object is built in memory, and the confirmation page renders that
object from react-router navigation state. Nothing is sent to a backend and nothing is persisted.

## Why it works this way

This is a training/demo app backed by the public [Fake Store API](https://fakestoreapi.com/products),
which is read-only in practice and has no order, payment, or account endpoints. Rather than fake a
backend, checkout is intentionally minimal — it exists to demonstrate the storefront flow, not to
process real orders. See `AGENTS.md` for the project-wide "don't add a real backend/payment
integration unless asked" rule.

## User flow

```
/cart  ──"Proceed to checkout"──▶  /checkout  ──"Place order"──▶  /order-confirmation/:orderId
```

1. **Cart** (`src/pages/storefront/CartPage.tsx`) — user reviews items, adjusts quantity, removes
   items. "Proceed to checkout" calls `navigate("/checkout")`. If the cart is empty, the page
   renders an empty-state instead and offers "Continue shopping".
2. **Checkout** (`src/pages/storefront/CheckoutPage.tsx`) — read-only order summary (line items +
   total) and a single **"Place order"** button. A note clarifies: _"This is a guest checkout demo
   — no account or payment details are required."_ There is **no** shipping address, contact, or
   payment form by design.
3. **Order confirmation** (`src/pages/storefront/OrderConfirmationPage.tsx`) — success icon, order
   id, item breakdown, total, and a "Continue shopping" link back to `/`.

## Key implementation details

### Order creation

Handled by `handlePlaceOrder` in `src/pages/storefront/CheckoutPage.tsx`:

```ts
const order: Order = {
  id: `ORD-${Date.now()}`,
  items,
  total,
  placedAt: new Date().toISOString(),
};
clear();
navigate(`/order-confirmation/${order.id}`, { state: { order } });
```

- **Order id** is client-generated (`ORD-` + timestamp), not returned by a server.
- **`items`** is the same `CartItem[]` held in the cart store.
- **`total`** comes from `getCartTotal()` in `src/lib/cart.ts` (`Σ quantity × product.price`).
- **`clear()`** empties the cart store immediately after building the order.

### Order shape

Defined in `src/types/order.ts`:

```ts
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  placedAt: string; // ISO 8601
}
```

### Passing the order to the confirmation page

The order travels via react-router **navigation state**, not a store or storage:

```ts
// CheckoutPage
navigate(`/order-confirmation/${order.id}`, { state: { order } });

// OrderConfirmationPage
const order = (location.state as { order?: Order } | null)?.order;
```

Consequence: **the order does not survive a page refresh.** On reload, `location.state` is gone,
so `order` is `undefined`. The page still renders the `ORD-…` id from the `:orderId` URL param, but
the line-item breakdown and total are hidden (the block is guarded by `{order && ( ... )}`).
There is no order-history store — orders are ephemeral by design.

### Related state and helpers

| Concern                 | Location                                                               |
| ----------------------- | ---------------------------------------------------------------------- |
| Cart items, `clear()`   | `src/store/cartStore.ts` (zustand + `persist`, key `cart-storage`)     |
| Cart count / total math | `src/lib/cart.ts` (`getCartCount`, `getCartTotal`)                     |
| Price formatting        | `src/lib/format.ts` (`formatPrice`)                                    |
| Route wiring            | `src/routes/AppRoutes.tsx` (`checkout`, `order-confirmation/:orderId`) |
| `Order` type            | `src/types/order.ts`                                                   |

## Gotcha: the `isPlacingOrder` guard

`CheckoutPage` has a `useEffect` that redirects to `/cart` whenever the cart is empty. Because
`handlePlaceOrder` calls `clear()` **before** navigating, that effect would otherwise fire on the
now-empty cart and bounce the user back to `/cart` instead of showing the confirmation.

The fix is an `isPlacingOrder` state flag that suppresses the redirect during order placement:

```ts
const [isPlacingOrder, setIsPlacingOrder] = useState(false);

useEffect(() => {
  if (items.length === 0 && !isPlacingOrder)
    navigate("/cart", { replace: true });
}, [items.length, isPlacingOrder, navigate]);

function handlePlaceOrder() {
  setIsPlacingOrder(true); // set BEFORE clear()
  // ...build order, clear(), navigate()
}
```

**Keep this guard if you touch `CheckoutPage`.** Removing it reintroduces the redirect race.

## Constraints / non-goals

- No account creation, login, or guest-vs-registered distinction.
- No shipping/contact/payment form or payment processing.
- No server call, no order persistence, no order history.
- Checkout and confirmation UI flows are covered by
  `src/pages/storefront/GuestCheckout.test.tsx`; the cart logic they depend on is covered by
  `src/lib/cart.test.ts` and `src/store/cartStore.test.ts`.

## Possible future extensions (not implemented)

- Persist placed orders to localStorage (or a store) so confirmation survives a refresh and an
  order-history page becomes possible.
- Add a shipping/contact form (still client-only) before placing the order.
- Generate order ids from a more collision-resistant scheme if orders ever persist.

## Related docs

- [Shopping cart](./shopping-cart.md) — the source of the items being checked out.
- [Storefront](./storefront.md) — the surrounding browse/add-to-cart flow.
