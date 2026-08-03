import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { products, inr } from "@/lib/mock-data";
import { Check, ShieldCheck } from "lucide-react";

import { Product } from "@/lib/mock-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Raghu Mobiles" }] }),
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
  component: Checkout,
});

function Checkout() {
  const loadedProducts = Route.useLoaderData();
  const [items] = useState(
    loadedProducts.length > 0 ? [{ p: loadedProducts[0], qty: 1 }] : []
  );
  const subtotal = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  const total = subtotal;
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <section className="container-page py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">Checkout</h1>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="card-soft p-6 space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Full name</Label><Input className="mt-2" defaultValue="Aarav Sharma" /></div>
                <div><Label>Phone</Label><Input className="mt-2" defaultValue="+91 98200 12345" /></div>
              </div>
              <div><Label>Email</Label><Input className="mt-2" defaultValue="aarav@example.com" /></div>
            </div>
            <div className="card-soft p-6 space-y-4">
              <h3 className="font-semibold">Delivery address</h3>
              <div><Label>Street address</Label><Input className="mt-2" defaultValue="12 Linking Road" /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><Label>City</Label><Input className="mt-2" defaultValue="Mumbai" /></div>
                <div><Label>State</Label><Input className="mt-2" defaultValue="MH" /></div>
                <div><Label>PIN</Label><Input className="mt-2" defaultValue="400050" /></div>
              </div>
            </div>
            <div className="card-soft p-6 space-y-4">
              <h3 className="font-semibold">Payment method</h3>
              <RadioGroup defaultValue="razorpay" className="grid gap-3">
                {[
                  { v: "razorpay", t: "Razorpay", d: "Cards, UPI, Netbanking, Wallets" },
                  { v: "upi", t: "UPI", d: "Google Pay, PhonePe, Paytm" },
                  { v: "cod", t: "Cash on Delivery", d: "Pay when your order arrives" },
                ].map((o) => (
                  <label key={o.v} className="flex items-center gap-4 border border-border rounded-2xl p-4 cursor-pointer hover:bg-secondary/50">
                    <RadioGroupItem value={o.v} />
                    <div className="flex-1"><div className="font-medium">{o.t}</div><div className="text-xs text-muted-foreground">{o.d}</div></div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
          <aside className="surface-panel p-6 h-fit sticky top-24 space-y-4">
            <h3 className="font-semibold">Order</h3>
            <div className="space-y-3">
              {items.map(({ p, qty }) => (
                <div key={p.id} className="flex gap-3">
                  <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{p.model}</div><div className="text-xs text-muted-foreground">Qty {qty}</div></div>
                  <div className="text-sm font-semibold">{inr(p.price * qty)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><span>Total</span><span>{inr(total)}</span></div>
            </div>
            <Button size="lg" className="w-full rounded-full h-12" onClick={() => navigate({ to: "/orders/$id", params: { id: "ORD-2045" } })}>
              Pay {inr(total)}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center"><ShieldCheck className="h-3 w-3" />Secure checkout by Razorpay</div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
