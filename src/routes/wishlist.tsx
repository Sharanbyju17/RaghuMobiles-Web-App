import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { ProductCard } from "@/components/product-card";
import { Heart } from "lucide-react";
import { useShop } from "@/contexts/shop-context";
import { Product } from "@/lib/mock-data";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Recell" }] }),
  loader: async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/inventory/products");
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((p: any) => ({
        id: p.id,
        brand: p.brand?.name || "Unknown",
        model: p.title,
        slug: p.sku,
        storage: p.specifications?.storage || "",
        color: p.specifications?.color || "",
        price: p.price,
        mrp: p.specifications?.original_price || p.price + 5000,
        condition: p.condition,
        batteryHealth: p.specifications?.battery || 100,
        warrantyMonths: p.specifications?.warrantyMonths || 6,
        imei: p.sku,
        status: p.stock_quantity > 0 ? "In Stock" : "Reserved",
        stock: p.stock_quantity,
        image: p.images?.[0] || "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=80",
        gallery: p.images || [],
        highlights: [p.specifications?.display, p.specifications?.processor].filter(Boolean),
        addedOn: new Date().toISOString()
      })) as Product[];
    } catch {
      return [];
    }
  },
  component: Wishlist,
});

function Wishlist() {
  const loadedProducts = Route.useLoaderData() as Product[];
  const { wishlistProductIds } = useShop();

  const items = loadedProducts.filter(p => wishlistProductIds.includes(p.id));

  return (
    <SiteLayout>
      <section className="container-page py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary"><Heart className="h-4 w-4 fill-red-500 stroke-red-500" /></div>
          <div><h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Wishlist</h1><p className="text-sm text-muted-foreground">{items.length} saved</p></div>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-24"><p className="text-muted-foreground">Your wishlist is empty.</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
