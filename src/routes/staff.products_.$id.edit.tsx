import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { StaffShell } from "@/components/layout/staff-shell";
import { ProductForm } from "@/components/inventory/product-form";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/staff/products_/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Product — Raghu Mobiles Staff" }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = useParams({ from: "/staff/products_/$id/edit" });
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/inventory/products/${id}`);
        if (res.ok) {
          setProduct(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  return (
    <StaffShell
      title="Edit Product"
      subtitle={`Update details for product #${id.split("-")[0]}`}
    >
      <div className="max-w-4xl mx-auto py-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading product data...</div>
        ) : product ? (
          <ProductForm initialData={product} onSubmitSuccess={() => navigate({ to: "/staff/products" })} />
        ) : (
          <div className="text-center text-destructive py-12">Product not found</div>
        )}
      </div>
    </StaffShell>
  );
}
