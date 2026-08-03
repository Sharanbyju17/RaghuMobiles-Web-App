import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { ProductCard } from "@/components/product-card";
import { products, brands } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { Product } from "@/lib/mock-data";

export const Route = createFileRoute("/buy/")({
  head: () => ({ meta: [{ title: "Buy Mobiles — Raghu Mobiles" }, { name: "description", content: "Shop wholesale mobiles iPhones, Samsung, OnePlus and more." }] }),
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
  component: BuyPage,
});

function Filters({ query, setQuery, brand, setBrand, price, setPrice, condition, setCondition }: any) {
  const conditions = ["Like New", "Excellent", "Good", "Fair"];
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Search</div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="iPhone, Samsung…" className="pl-9 rounded-xl bg-secondary border-0" />
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Brand</div>
        <div className="flex flex-wrap gap-2">
          {["All", ...brands].map((b) => (
            <button key={b} onClick={() => setBrand(b)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${brand === b ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-secondary border-border"
                }`}>{b}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Condition</div>
        <div className="flex flex-wrap gap-2">
          {["All", ...conditions].map((c) => (
            <button key={c} onClick={() => setCondition(c)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${condition === c ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-secondary border-border"
                }`}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Max price: ₹{price.toLocaleString()}</div>
        <Slider value={[price]} min={10000} max={80000} step={1000} onValueChange={(v) => setPrice(v[0])} />
      </div>
    </div>
  );
}

function BuyPage() {
  const products = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [condition, setCondition] = useState("All");
  const [price, setPrice] = useState(80000);

  const filtered = useMemo(() => products.filter((p: Product) =>
    (brand === "All" || p.brand === brand) &&
    (condition === "All" || p.condition === condition) &&
    p.price <= price &&
    (query === "" || `${p.brand} ${p.model}`.toLowerCase().includes(query.toLowerCase()))
  ), [query, brand, condition, price]);

  const filterProps = { query, setQuery, brand, setBrand, price, setPrice, condition, setCondition };

  return (
    <SiteLayout>
      <section className="container-page py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Buy Mobiles</h1>
            <p className="text-muted-foreground mt-1 text-sm">{filtered.length} devices available</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="mb-6">Filters</SheetTitle>
              <Filters {...filterProps} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 surface-panel p-6">
              <Filters {...filterProps} />
            </div>
          </aside>
          <div>
            {(brand !== "All" || condition !== "All" || query) && (
              <div className="flex gap-2 flex-wrap mb-4">
                {brand !== "All" && <Badge variant="secondary" className="rounded-full gap-1">{brand} <X className="h-3 w-3 cursor-pointer" onClick={() => setBrand("All")} /></Badge>}
                {condition !== "All" && <Badge variant="secondary" className="rounded-full gap-1">{condition} <X className="h-3 w-3 cursor-pointer" onClick={() => setCondition("All")} /></Badge>}
                {query && <Badge variant="secondary" className="rounded-full gap-1">"{query}" <X className="h-3 w-3 cursor-pointer" onClick={() => setQuery("")} /></Badge>}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p: Product) => <ProductCard key={p.id} p={p} />)}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-24 text-muted-foreground">No devices match your filters.</div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
