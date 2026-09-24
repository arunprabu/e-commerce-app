import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const product = products.find((p) => p.id === Number(id));

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <Button asChild>
          <Link to="/">Back to products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex h-96 items-center justify-center rounded-lg border bg-white p-8">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit capitalize">
          {product.category}
        </Badge>
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          {product.rating.rate} ({product.rating.count} reviews)
        </div>
        <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-10 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              addItem(product, quantity);
              toast.success("Added to cart", {
                description: `${quantity} \u00d7 ${product.title}`,
              });
            }}
          >
            Add to cart
          </Button>
        </div>

        <Link
          to="/"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          &larr; Back to products
        </Link>
      </div>
    </div>
  );
}
