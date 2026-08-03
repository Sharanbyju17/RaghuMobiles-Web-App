import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { products, inr } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShieldCheck, Truck, RotateCcw, Check, ShoppingBag } from "lucide-react";

import { Product } from "@/lib/mock-data";
import { useShop } from "@/contexts/shop-context";

export const Route = createFileRoute("/buy/$id")({
  loader: async ({ params }) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/inventory/products");
      if (!res.ok) throw notFound();
      const data = await res.json();
      const p = data.find((x: any) => x.sku === params.id);
      if (!p) throw notFound();
      
      const product: Product = {
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
        gallery: p.images?.length ? p.images : ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=900&q=80"],
        highlights: [p.specifications?.display, p.specifications?.processor].filter(Boolean) as string[],
        addedOn: new Date().toISOString()
      };
      
      return { product };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.product.model} — Raghu Mobiles` }, { name: "description", content: loaderData.product.highlights.join(" · ") }, { property: "og:image", content: loaderData.product.image }]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <SiteLayout><div className="container-page py-32 text-center"><h1 className="text-2xl font-semibold">Product not found</h1><Button asChild className="mt-6 rounded-full"><Link to="/buy">Back to shop</Link></Button></div></SiteLayout>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { product: p } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const isHearted = isInWishlist(p.id);
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  return (
    <SiteLayout>
      <section className="container-page py-10 md:py-14">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link to="/buy" className="hover:text-foreground">Buy</Link> <span className="mx-1">/</span> {p.brand} <span className="mx-1">/</span> <span className="text-foreground">{p.model}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-square rounded-3xl bg-surface overflow-hidden">
              <img src={p.gallery[active]} alt={p.model} className="h-full w-full object-cover" />
            </div>
            {p.gallery.length > 1 && (
              <div className="mt-4 flex gap-3">
                {p.gallery.map((g: string, i: number) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`h-20 w-20 rounded-2xl overflow-hidden border-2 transition-colors ${active === i ? "border-foreground" : "border-transparent"}`}>
                    <img src={g} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="rounded-full">{p.condition}</Badge>
              <Badge variant="outline" className="rounded-full">Battery {p.batteryHealth}%</Badge>
              <Badge variant="outline" className="rounded-full">{p.warrantyMonths}-mo warranty</Badge>
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-4">{p.brand}</div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">{p.model}</h1>
            <div className="text-muted-foreground mt-1">{p.storage} · {p.color}</div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-semibold">{inr(p.price)}</span>
              <span className="text-muted-foreground line-through">{inr(p.mrp)}</span>
              <Badge className="bg-success text-success-foreground rounded-full">Save {off}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes · EMI from ₹{Math.round(p.price / 12).toLocaleString()}/mo</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button size="lg" onClick={() => addToCart(p.id)} className="rounded-full h-12">
                <ShoppingBag className="h-4 w-4 mr-2" />Add to cart
              </Button>
              <Button size="lg" variant={isHearted ? "default" : "outline"} onClick={() => toggleWishlist(p.id)} className="rounded-full h-12">
                <Heart className={`h-4 w-4 mr-2 ${isHearted ? 'fill-white' : ''}`} />{isHearted ? "Wishlisted" : "Wishlist"}
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              {[{ i: ShieldCheck, t: "Warranty" }, { i: Truck, t: "Free delivery" }, { i: RotateCcw, t: "7-day return" }].map((x) => (
                <div key={x.t} className="surface-panel p-4 flex flex-col items-start gap-2">
                  <x.i className="h-4 w-4" /><span className="font-medium">{x.t}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">Highlights</h3>
              <ul className="space-y-2">
                {p.highlights.map((h: string) => (
                  <li key={h} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" />{h}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 surface-panel p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Device details</div>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted-foreground">IMEI</dt><dd className="font-mono text-xs">{p.imei}</dd>
                <dt className="text-muted-foreground">Storage</dt><dd>{p.storage}</dd>
                <dt className="text-muted-foreground">Color</dt><dd>{p.color}</dd>
                <dt className="text-muted-foreground">Battery</dt><dd>{p.batteryHealth}%</dd>
                <dt className="text-muted-foreground">Warranty</dt><dd>{p.warrantyMonths} months</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
