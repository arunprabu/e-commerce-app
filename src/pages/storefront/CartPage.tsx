import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { getCartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Button asChild>
          <Link to="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const total = getCartTotal(items);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-white">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Link
                to={`/product/${product.id}`}
                className="line-clamp-1 text-sm font-medium hover:underline"
              >
                {product.title}
              </Link>
              <span className="text-sm text-muted-foreground">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(product.id, quantity - 1)}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(product.id, quantity + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <span className="w-20 text-right font-medium">
              {formatPrice(product.price * quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(product.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex h-fit flex-col gap-4 rounded-lg border p-4">
        <h2 className="font-semibold">Order summary</h2>
        <Separator />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <Button onClick={() => navigate("/checkout")}>
          Proceed to checkout
        </Button>
        <Link
          to="/"
          className="text-center text-sm text-muted-foreground underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
