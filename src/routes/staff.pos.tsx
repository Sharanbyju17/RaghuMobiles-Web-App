import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/layout/staff-shell";
import { products, inr, type Product } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, Minus, X, Banknote, CreditCard, QrCode, Split, Printer, User, Percent } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/staff/pos")({
  head: () => ({ meta: [{ title: "POS Billing — Staff" }] }),
  component: POS,
});

interface CartLine { p: any; qty: number }

function POS() {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState("cash");
  const [inventory, setInventory] = useState<any[]>([]);
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/inventory/products", {
          headers: { "Authorization": `Bearer ${session?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((p: any) => ({
            id: p.id,
            brand: p.brand?.name?.toLowerCase() || "unknown",
            brandDisplay: p.brand?.name || "Unknown",
            model: p.title,
            storage: p.specifications?.storage || "",
            price: p.price,
            imei: p.sku,
            status: p.stock_quantity > 0 ? "In Stock" : "Reserved",
            image: p.images?.[0] || ""
          }));
          setInventory(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch inventory", err);
      }
    };
    if (session?.token) fetchInventory();
  }, [session]);

  const results = useMemo(() => inventory.filter((p) =>
    p.status === "In Stock" && (q === "" || `${p.brandDisplay} ${p.model} ${p.imei}`.toLowerCase().includes(q.toLowerCase()))
  ), [q, inventory]);

  const add = (p: any) => setCart((c) => {
    const ex = c.find((x) => x.p.id === p.id);
    return ex ? c.map((x) => x.p.id === p.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { p, qty: 1 }];
  });
  const change = (id: string, d: number) => setCart((c) => c.map((x) => x.p.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const remove = (id: string) => setCart((c) => c.filter((x) => x.p.id !== id));

  const subtotal = cart.reduce((s, x) => s + x.p.price * x.qty, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = Math.max(0, subtotal + tax - discount);

  const handleCharge = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        order_type: "POS",
        status: "COMPLETED",
        total_amount: subtotal,
        tax_amount: tax,
        discount_amount: discount,
        final_amount: total,
        handled_by_id: session?.user?.id,
        items: cart.map(c => ({
          product_id: c.p.id,
          quantity: c.qty,
          unit_price: c.p.price,
          subtotal: c.p.price * c.qty
        }))
      };

      const res = await fetch("http://localhost:8000/api/v1/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setOrderComplete(true);
        // Clear cart after a moment
        setTimeout(() => {
          setCart([]);
          setCustomerName("");
          setCustomerPhone("");
          setDiscount(0);
          setOrderComplete(false);
        }, 2000);
      } else {
        console.error("Order failed", await res.text());
      }
    } catch (err) {
      console.error("Error submitting order", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StaffShell title="POS Billing" subtitle="Offline in-store checkout"
      actions={<Badge variant="outline" className="rounded-full">Cashier: Staff</Badge>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Product panel */}
        <div className="card-soft p-5 flex flex-col min-h-[70vh]">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Scan barcode or search by model / IMEI…" className="pl-10 h-12 rounded-2xl bg-secondary border-0 text-base" autoFocus />
          </div>
          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="rounded-full">
              <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
              <TabsTrigger value="apple" className="rounded-full">Apple</TabsTrigger>
              <TabsTrigger value="samsung" className="rounded-full">Samsung</TabsTrigger>
              <TabsTrigger value="oneplus" className="rounded-full">OnePlus</TabsTrigger>
              <TabsTrigger value="acc" className="rounded-full">Accessories</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.map((p) => (
                  <button key={p.id} onClick={() => add(p)} className="group text-left surface-panel p-3 hover:shadow-[var(--shadow-elevated)] hover:border-foreground/20 transition-all">
                    <div className="aspect-square rounded-xl bg-surface overflow-hidden mb-3"><img src={p.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" /></div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.brand}</div>
                    <div className="text-sm font-medium truncate">{p.model}</div>
                    <div className="text-xs text-muted-foreground">{p.storage}</div>
                    <div className="mt-2 text-sm font-semibold">{inr(p.price)}</div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cart panel */}
        <div className="card-soft flex flex-col min-h-[70vh]">
          <div className="p-5 border-b border-border/60">
            <div className="flex items-center gap-2 mb-3"><User className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Customer</span></div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="rounded-xl h-10" />
              <Input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="rounded-xl h-10" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[40vh]">
            {cart.length === 0 && <div className="text-center py-16 text-sm text-muted-foreground">Scan or tap a product to start billing</div>}
            {cart.map(({ p, qty }) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-11 w-11 rounded-lg object-cover bg-surface" />
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{p.model}</div><div className="text-xs text-muted-foreground">{inr(p.price)}</div></div>
                <div className="flex items-center gap-1 rounded-full bg-secondary p-0.5">
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => change(p.id, -1)}><Minus className="h-3 w-3" /></Button>
                  <span className="w-5 text-center text-xs font-medium">{qty}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => change(p.id, 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <div className="text-sm font-semibold w-20 text-right">{inr(p.price * qty)}</div>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => remove(p.id)}><X className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-border/60 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span>{inr(tax)}</span></div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value) || 0)} placeholder="Discount ₹" className="rounded-xl h-9" />
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border"><span>Total</span><span>{inr(total)}</span></div>

            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Payment method</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: "cash", i: Banknote, l: "Cash" },
                  { v: "card", i: CreditCard, l: "Card" },
                  { v: "upi", i: QrCode, l: "UPI" },
                  { v: "split", i: Split, l: "Split" },
                ].map((m) => (
                  <button key={m.v} onClick={() => setPayment(m.v)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors ${
                      payment === m.v ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:bg-secondary"
                    }`}>
                    <m.i className="h-4 w-4" /><span className="text-xs font-medium">{m.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {payment === "upi" && (
              <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3">
                <div className="h-20 w-20 rounded-xl bg-background border border-border grid place-items-center"><QrCode className="h-12 w-12" /></div>
                <div><div className="text-sm font-medium">Scan to pay {inr(total)}</div><div className="text-xs text-muted-foreground">raghumobiles@upi</div></div>
              </div>
            )}

            <Button size="lg" className="w-full rounded-full h-12" disabled={cart.length === 0 || isProcessing} onClick={handleCharge}>
              {isProcessing ? "Processing..." : `Charge ${inr(total)}`}
            </Button>
            <Dialog open={orderComplete} onOpenChange={setOrderComplete}>
              <DialogContent className="max-w-sm p-0 overflow-hidden">
                <DialogTitle className="sr-only">Receipt</DialogTitle>
                <div className="p-6 bg-background">
                  <div className="text-center pb-4 border-b border-dashed border-border">
                    <div className="font-bold text-lg tracking-tight">RAGHU MOBILES WHOLESALE</div>
                    <div className="text-xs text-muted-foreground">Bandra Flagship · +91 98200 00000</div>
                  </div>
                  <div className="py-3 text-xs text-muted-foreground flex justify-between">
                    <span>#INV-8842</span><span>{new Date().toLocaleString("en-IN")}</span>
                  </div>
                  {customerName && <div className="text-xs text-muted-foreground pb-2">Customer: {customerName} {customerPhone && `· ${customerPhone}`}</div>}
                  <div className="space-y-1.5 py-3 border-t border-dashed border-border text-sm">
                    {cart.map(({ p, qty }) => (
                      <div key={p.id} className="flex justify-between gap-2">
                        <span className="truncate">{p.model} × {qty}</span>
                        <span className="tabular-nums">{inr(p.price * qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 py-3 border-t border-dashed border-border text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>GST</span><span>{inr(tax)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>-{inr(discount)}</span></div>}
                    <div className="flex justify-between font-semibold pt-1 border-t border-border"><span>Total</span><span>{inr(total)}</span></div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1"><span>Paid via {payment.toUpperCase()}</span><span>PAID</span></div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground pt-3 border-t border-dashed border-border">Thank you for shopping with Raghu Mobiles Wholesale</div>
                </div>
                <div className="p-4 bg-surface flex gap-2 border-t border-border">
                  <Button variant="outline" className="flex-1 rounded-full">Email</Button>
                  <Button className="flex-1 rounded-full" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" />Print</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </StaffShell>
  );
}
