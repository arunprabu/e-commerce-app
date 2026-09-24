import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createProductRequest, updateProductRequest } from "@/api/products";
import { useProductOverlayStore } from "@/store/productOverlayStore";

interface FormState {
  title: string;
  price: string;
  category: string;
  description: string;
  image: string;
}

const emptyForm: FormState = {
  title: "",
  price: "",
  category: "",
  description: "",
  image: "",
};

export function AdminProductFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { products, categories, loading } = useProducts();
  const addToOverlay = useProductOverlayStore((s) => s.addProduct);
  const editInOverlay = useProductOverlayStore((s) => s.editProduct);

  const existingProduct = useMemo(
    () => (isEditMode ? products.find((p) => p.id === Number(id)) : undefined),
    [products, id, isEditMode],
  );

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(!isEditMode);

  useEffect(() => {
    if (isEditMode && existingProduct && !hydrated) {
      setForm({
        title: existingProduct.title,
        price: String(existingProduct.price),
        category: existingProduct.category,
        description: existingProduct.description,
        image: existingProduct.image,
      });
      setHydrated(true);
    }
  }, [isEditMode, existingProduct, hydrated]);

  if (isEditMode && !loading && !existingProduct) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Product not found</p>
        <Button asChild>
          <Link to="/admin/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.description.trim())
      nextErrors.description = "Description is required.";
    if (!form.image.trim()) nextErrors.image = "Image URL is required.";
    const priceNum = Number(form.price);
    if (!form.price.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      nextErrors.price = "Enter a price greater than 0.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const input = {
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    };

    setSubmitting(true);
    try {
      if (isEditMode && existingProduct) {
        await updateProductRequest(existingProduct.id, input);
        editInOverlay(existingProduct.id, { ...existingProduct, ...input });
        toast.success("Product updated");
      } else {
        await createProductRequest(input);
        // fakestoreapi always echoes id 21 for new products, so we assign our own unique id locally.
        addToOverlay({
          id: Date.now(),
          ...input,
          rating: { rate: 0, count: 0 },
        });
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch {
      toast.error(
        isEditMode ? "Could not update product." : "Could not create product.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {isEditMode ? "Edit product" : "Add product"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. electronics"
          />
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="cursor-pointer capitalize"
                  onClick={() => setForm({ ...form, category: c })}
                >
                  {c}
                </Badge>
              ))}
            </div>
          )}
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
          />
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image}</p>
          )}
          {form.image && (
            <div className="flex h-24 w-24 items-center justify-center rounded border bg-white p-2">
              <img
                src={form.image}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.visibility = "visible";
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Saving..."
              : isEditMode
                ? "Save changes"
                : "Create product"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
