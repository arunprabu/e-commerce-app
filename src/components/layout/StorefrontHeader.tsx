import { Link } from "react-router-dom";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { getCartCount } from "@/lib/cart";

export function StorefrontHeader() {
  const items = useCartStore((s) => s.items);
  const count = getCartCount(items);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" />
          ShopEasy
        </Link>
        <Link to="/cart" className="relative flex items-center gap-2 text-sm">
          <ShoppingCart className="size-5" />
          Cart
          {count > 0 && (
            <Badge className="absolute -top-2 -right-3 h-5 min-w-5 justify-center rounded-full px-1">
              {count}
            </Badge>
          )}
        </Link>
      </div>
    </header>
  );
}
