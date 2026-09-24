import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProductDialog } from "@/components/admin/DeleteProductDialog";
import { formatPrice } from "@/lib/format";
import { deleteProductRequest } from "@/api/products";
import { useProductOverlayStore } from "@/store/productOverlayStore";
import type { Product } from "@/types/product";

export function AdminProductsPage() {
  const { products, loading, error, refetch } = useProducts();
  const removeFromOverlay = useProductOverlayStore((s) => s.deleteProduct);
  const [query, setQuery] = useState("");
  const [productPendingDelete, setProductPendingDelete] =
    useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.title.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query],
  );

  async function handleConfirmDelete() {
    if (!productPendingDelete) return;
    setDeleting(true);
    try {
      await deleteProductRequest(productPendingDelete.id);
      removeFromOverlay(productPendingDelete.id);
      toast.success("Product deleted");
      setProductPendingDelete(null);
    } catch {
      toast.error("Could not delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex gap-3">
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:w-64"
          />
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="size-4" /> Add product
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            {error}
            <Button size="sm" variant="outline" onClick={refetch}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-10 w-10 rounded border bg-white object-contain"
                    />
                    <span className="line-clamp-1 max-w-xs">
                      {product.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/products/${product.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setProductPendingDelete(product)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <DeleteProductDialog
        product={productPendingDelete}
        loading={deleting}
        onCancel={() => setProductPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
