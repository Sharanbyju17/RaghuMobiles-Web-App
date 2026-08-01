import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Check, Package, Truck, Home } from "lucide-react";
import { products, inr } from "@/lib/mock-data";

export const Route = createFileRoute("/orders/$id")({
  head: ({ params }) => ({ meta: [{ title: `Order ${params.id} — Recell` }] }),
  component: OrderTrack,
});

function OrderTrack() {
  const { id } = Route.useParams();
  const p = products[0];
  const steps = [
    { i: Check, t: "Order placed", d: "Nov 15, 10:24 AM", done: true },
    { i: Package, t: "Packed", d: "Nov 15, 4:10 PM", done: true },
    { i: Truck, t: "Out for delivery", d: "Nov 16, 9:00 AM", done: true, active: true },
    { i: Home, t: "Delivered", d: "Expected by 7 PM", done: false },
  ];
  return (
    <SiteLayout>
      <section className="container-page py-10 md:py-14 max-w-3xl">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Order</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">{id}</h1>
        <p className="text-muted-foreground mt-1">Placed on Nov 15, 2025 · Paid via Razorpay</p>

        <div className="mt-10 card-soft p-6 md:p-8">
          <div className="relative space-y-6">
            {steps.map((s, i) => (
              <div key={s.t} className="flex gap-4 items-start">
                <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 z-10 ${
                  s.active ? "bg-foreground text-background ring-4 ring-foreground/10" : s.done ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                }`}><s.i className="h-4 w-4" /></div>
                <div className="pt-1.5"><div className="font-medium">{s.t}</div><div className="text-xs text-muted-foreground">{s.d}</div></div>
                {i < steps.length - 1 && <div className={`absolute left-5 top-10 h-14 w-px ${s.done ? "bg-foreground" : "bg-border"}`} style={{ top: `${i * 88 + 40}px` }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 card-soft p-6 flex gap-4 items-center">
          <img src={p.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
          <div className="flex-1"><div className="font-medium">{p.model}</div><div className="text-xs text-muted-foreground">{p.storage} · {p.color}</div></div>
          <div className="font-semibold">{inr(p.price)}</div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" asChild className="rounded-full"><Link to="/">Back to home</Link></Button>
          <Button asChild className="rounded-full"><Link to="/buy">Continue shopping</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
