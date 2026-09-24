import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden py-0">
      <Link to={`/product/${product.id}`} className="flex flex-1 flex-col">
        <div className="flex h-48 items-center justify-center bg-white p-4">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 pt-4">
          <Badge variant="secondary" className="w-fit capitalize">
            {product.category}
          </Badge>
          <h3 className="line-clamp-2 text-sm font-medium">{product.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            {product.rating.rate} ({product.rating.count})
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between pb-4">
        <span className="font-semibold">{formatPrice(product.price)}</span>
        <Button
          size="sm"
          onClick={() => {
            addItem(product, 1);
            toast.success("Added to cart", { description: product.title });
          }}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
