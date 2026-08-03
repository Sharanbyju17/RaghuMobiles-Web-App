import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { products, inr } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { useState } from "react";

import { Product } from "@/lib/mock-data";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Raghu Mobiles" }] }),
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
  component: Cart,
});

import { useShop } from "@/contexts/shop-context";

function Cart() {
  const loadedProducts = Route.useLoaderData() as Product[];
  const { cartItems, removeFromCart, addToCart } = useShop();

  const items = cartItems.map(item => ({
    qty: item.quantity,
    p: loadedProducts.find(p => p.id === item.product_id)
  })).filter(i => i.p !== undefined) as { qty: number, p: Product }[];

  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const shipping = subtotal > 30000 ? 0 : 199;
  const total = subtotal + shipping;

  return (
    <SiteLayout>
      <section className="container-page py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">Your cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-24"><p className="text-muted-foreground">Your cart is empty.</p><Button asChild className="mt-6 rounded-full"><Link to="/buy">Continue shopping</Link></Button></div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map(({ p, qty }, idx) => (
                <div key={p.id} className="card-soft p-4 md:p-5 flex gap-4 items-center">
                  <img src={p.image} alt={p.model} className="h-24 w-24 rounded-xl object-cover bg-surface shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{p.brand}</div>
                    <Link to="/buy/$id" params={{ id: p.slug }} className="font-medium hover:underline block truncate">{p.model}</Link>
                    <div className="text-xs text-muted-foreground">{p.storage} · {p.color} · {p.condition}</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-secondary p-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => addToCart(p.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => addToCart(p.id, 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <div className="font-semibold shrink-0 w-24 text-right">{inr(p.price * qty)}</div>
                  <Button size="icon" variant="ghost" className="rounded-full shrink-0" onClick={() => removeFromCart(p.id)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <aside className="surface-panel p-6 h-fit sticky top-24 space-y-4">
              <h3 className="font-semibold">Order summary</h3>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
              <div className="border-t border-border pt-4 flex justify-between font-semibold"><span>Total</span><span>{inr(total)}</span></div>
              <div className="flex gap-2"><Input placeholder="Promo code" className="rounded-xl" /><Button variant="outline" className="rounded-xl">Apply</Button></div>
              <Button size="lg" asChild className="w-full rounded-full h-12"><Link to="/checkout">Checkout <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
