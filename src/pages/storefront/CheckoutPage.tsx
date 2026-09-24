import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { getCartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const navigate = useNavigate();
  // Placing an order clears the cart, which would otherwise re-trigger the empty-cart redirect below.
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder)
      navigate("/cart", { replace: true });
  }, [items.length, isPlacingOrder, navigate]);

  if (items.length === 0) return null;

  const total = getCartTotal(items);

  function handlePlaceOrder() {
    setIsPlacingOrder(true);
    const order: Order = {
      id: `ORD-${Date.now()}`,
      items,
      total,
      placedAt: new Date().toISOString(),
    };
    clear();
    navigate(`/order-confirmation/${order.id}`, { state: { order } });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex justify-between text-sm">
            <span>
              {product.title} &times; {quantity}
            </span>
            <span>{formatPrice(product.price * quantity)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        This is a guest checkout demo &mdash; no account or payment details are
        required.
      </p>
      <Button size="lg" onClick={handlePlaceOrder}>
        Place order
      </Button>
    </div>
  );
}
