import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-12 text-center">
      <CheckCircle2 className="size-12 text-green-600" />
      <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
      <p className="text-muted-foreground">
        Order <span className="font-mono">{orderId}</span> has been placed.
      </p>
      {order && (
        <div className="w-full rounded-lg border p-4 text-left">
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between py-1 text-sm">
              <span>
                {product.title} &times; {quantity}
              </span>
              <span>{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
      <Button asChild>
        <Link to="/">Continue shopping</Link>
      </Button>
    </div>
  );
}
