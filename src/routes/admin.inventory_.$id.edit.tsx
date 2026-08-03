import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/admin-shell";
import { ProductForm, ProductFormData } from "@/components/inventory/product-form";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/inventory_/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Product — Raghu Mobiles Admin" }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [productData, setProductData] = useState<(Partial<ProductFormData> & { images?: string[], videos?: string[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/inventory/products/${id}`, {
          headers: { "Authorization": `Bearer ${session?.token}` }
        });
        if (res.ok) {
          const p = await res.json();
          setProductData({
            title: p.title,
            brand: p.brand?.name || p.specifications?.brand_name || "",
            price: p.price.toString(),
            originalPrice: p.specifications?.original_price?.toString() || "",
            sku: p.sku,
            category: p.category?.name || p.specifications?.category_name || "Smart Phone",
            stock: p.stock_quantity.toString(),
            color: p.specifications?.color || "",
            condition: p.condition,
            description: p.description || "",
            ram: p.specifications?.ram || "",
            storage: p.specifications?.storage || "",
            images: p.images || [],
            videos: p.videos || []
          });
        } else {
          alert("Failed to fetch product details");
          navigate({ to: "/admin/inventory" });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.token) fetchProduct();
  }, [id, session, navigate]);

  return (
    <AdminShell
      title="Edit Product"
      subtitle="Update device details and media"
    >
      <div className="max-w-4xl mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : productData ? (
          <ProductForm 
            initialData={productData} 
            productId={id}
            onSubmitSuccess={() => navigate({ to: "/admin/inventory" })} 
          />
        ) : null}
      </div>
    </AdminShell>
  );
}
