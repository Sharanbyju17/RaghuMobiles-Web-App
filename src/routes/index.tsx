import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, RotateCcw, Truck, Sparkles, CheckCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/mock-data";

export const Route = createFileRoute("/")({ 
  component: Home,
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
  }
});

function Home() {
  const products = Route.useLoaderData();
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-28 pb-16">
        {/* Soft Background glow for hero area */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E5E9FC] blur-[100px] rounded-full pointer-events-none dark:bg-[#7A5CFF]/10" />
        </div>
        
        <div className="container-page relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="max-w-xl text-center lg:text-left pt-10">
            <Badge variant="secondary" className="rounded-full mb-8 py-1.5 px-3 gap-2 bg-transparent border-0 shadow-none text-[#7A5CFF] font-semibold text-xs tracking-wide">
              <Sparkles className="h-3.5 w-3.5" /> Premium Refurbished
            </Badge>
            
            <h1 className="text-6xl md:text-7xl lg:text-[88px] font-bold tracking-tighter leading-[1.05] animate-fade-up">
              <span className="text-foreground">Smart.</span> <br/>
              <span className="text-foreground">Stylish.</span> <br/>
              <span className="text-gradient-primary">Sustainable.</span>
            </h1>
            
            <p className="mt-8 text-[17px] text-muted-foreground leading-relaxed animate-fade-up font-medium" style={{ animationDelay: "150ms" }}>
              Premium devices. Premium experience. <br/>
              Better for you, better for the planet.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <Button size="lg" asChild className="rounded-full h-12 px-8 text-[15px] font-semibold bg-gradient-to-r from-primary to-[#7A5CFF] hover:opacity-90 text-white shadow-glow-blue transition-all duration-300 hover:scale-[1.02] border-0">
                <Link to="/buy">Shop now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full h-12 px-8 text-[15px] font-semibold bg-[#E8EBF5] dark:bg-[#121838] hover:bg-[#DEE2F0] text-foreground border-0 transition-all duration-300 hover:scale-[1.02]">
                <Link to="/buy">Explore deals</Link>
              </Button>
            </div>
          </div>
          
          {/* Right Content - Phone & Podium */}
          <div className="relative w-full lg:w-[500px] h-[550px] flex justify-center items-center animate-fade-in mt-10 lg:mt-0" style={{ animationDelay: "400ms" }}>
            
            {/* 3D Podium base */}
            <div className="absolute bottom-10 w-[380px] h-[100px] bg-gradient-to-b from-[#FFFFFF] to-[#DCE1F2] dark:from-[#0D122B] dark:to-[#060918] rounded-[100%] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border-[3px] border-white dark:border-white/10 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] h-[80px] bg-gradient-to-b from-[#F2F4FA] to-[#FFFFFF] dark:from-[#151C3E] dark:to-[#0D122B] rounded-[100%] border border-[#E2E6F5] dark:border-white/5" />
            </div>
            
            {/* Glowing Rings behind phone */}
            <div className="absolute bottom-20 w-[420px] h-[120px] rounded-[100%] border-2 border-cyan-400/30 blur-[2px] animate-[spin_10s_linear_infinite]" style={{ transform: 'rotateX(60deg)' }} />
            <div className="absolute bottom-20 w-[360px] h-[100px] rounded-[100%] border-2 border-primary/40 blur-[1px] animate-[spin_8s_linear_infinite_reverse]" style={{ transform: 'rotateX(60deg)' }} />

            {/* Phone Image */}
            <div className="relative z-10 w-[240px] h-[480px] animate-float drop-shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=600" 
                alt="Phone" 
                className="w-full h-full object-cover rounded-[2.5rem] border-[4px] border-white dark:border-[#1F2959] shadow-pop -rotate-12 transform scale-110"
              />
            </div>
            
            {/* Floating Stats Panel */}
            <div className="absolute top-10 -right-4 lg:-right-12 z-20 w-[120px] glass-panel p-4 flex flex-col gap-5 rounded-3xl animate-float text-center shadow-lg bg-white/70 backdrop-blur-xl border-white" style={{ animationDelay: '1s' }}>
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg leading-none">10K+</span>
                <span className="text-[10px] text-muted-foreground leading-tight font-medium">Happy<br/>Customers</span>
              </div>
              <div className="w-6 h-px bg-border/50 mx-auto" />
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg leading-none">4.8 <span className="text-primary text-sm">★</span></span>
                <span className="text-[10px] text-muted-foreground leading-tight font-medium">Rated<br/>Excellent</span>
              </div>
              <div className="w-6 h-px bg-border/50 mx-auto" />
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg leading-none">6-12</span>
                <span className="text-[10px] text-muted-foreground leading-tight font-medium">Month<br/>Warranty</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-6 relative z-10 container-page">
        <div className="glass-panel bg-white/70 dark:bg-[#0D122B]/80 backdrop-blur-2xl rounded-[32px] p-6 md:px-12 md:py-8 border border-white/60 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-up shadow-sm">
          {[
            { icon: ShieldCheck, title: "6-12 month warranty", desc: "On every certified device" },
            { icon: RotateCcw, title: "7-day easy returns", desc: "No questions asked" },
            { icon: Truck, title: "Free next-day delivery", desc: "Across metro cities" },
          ].map((f, i) => (
            <div key={f.title} className="flex items-center gap-4 group">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-transparent border border-border/50 text-foreground group-hover:scale-110 transition-transform duration-500 shrink-0">
                <f.icon className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-foreground leading-tight">{f.title}</div>
                <div className="text-[13px] text-muted-foreground font-medium">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container-page py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">Trending this week</h2>
            <p className="text-[14px] text-muted-foreground mt-1 font-medium">Hand-picked devices at their best price.</p>
          </div>
          <Link to="/buy" className="text-sm font-semibold flex items-center group">
            View all 
            <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p: Product, i: number) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Sell CTA */}
      <section className="container-page pb-24 relative z-10">
        <div className="relative rounded-[40px] bg-gradient-to-r from-[#E9EDFA] to-[#F3F1FD] dark:from-[#0D122B] dark:to-[#151C3E] overflow-hidden p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 group border border-white/50 dark:border-white/10 shadow-sm">
          
          <div className="relative z-10 max-w-lg">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.2]">
              Upgrade your phone, <span className="text-[#7A5CFF]">on us.</span>
            </h3>
            <p className="mt-4 text-[15px] text-muted-foreground font-medium">Get an instant quote for your old device.<br/>Free pickup, instant payment.</p>
            <Button size="lg" asChild className="mt-8 rounded-full h-12 px-6 text-sm font-semibold bg-gradient-to-r from-primary to-[#7A5CFF] text-white hover:opacity-90 shadow-glow-blue transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 border-0">
              <Link to="/sell">Get instant quote <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
          
          <div className="relative z-10 h-64 w-64 md:h-72 md:w-80 shrink-0 flex items-center justify-center perspective-[1000px]">
            {/* Background glowing rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-cyan-400/20 animate-[spin_12s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateY(20deg)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-[#7A5CFF]/30 animate-[spin_10s_linear_infinite_reverse]" style={{ transform: 'rotateX(60deg) rotateY(20deg)' }} />
            
            {/* Floating Glass Phone / UI Card */}
            <div className="relative z-10 w-[170px] h-[310px] bg-white/40 dark:bg-[#0D122B]/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col p-4 animate-float" style={{ transform: 'rotateY(-15deg) rotateX(10deg)' }}>
              
              {/* Fake UI Header */}
              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="w-12 h-1.5 bg-foreground/10 rounded-full" />
                <div className="w-3 h-3 bg-[#7A5CFF]/20 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#7A5CFF] rounded-full animate-ping" />
                </div>
              </div>
              
              {/* Fake Phone Analysis */}
              <div className="flex-1 flex flex-col items-center justify-center gap-3 relative">
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 h-[2px] bg-[#7A5CFF] shadow-[0_0_12px_rgba(122,92,255,0.9)] animate-[scan_2s_ease-in-out_infinite]" />
                
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#7A5CFF]/40 flex items-center justify-center animate-[spin_4s_linear_infinite]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7A5CFF]/20 to-primary/20 backdrop-blur-md border border-white/40" />
                </div>
                
                <div className="text-center mt-3">
                  <div className="text-[13px] font-bold text-foreground">Analyzing...</div>
                  <div className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest font-semibold">System Check</div>
                </div>
              </div>
              
              {/* Value Box */}
              <div className="mt-auto bg-white/80 dark:bg-[#151C3E]/80 backdrop-blur-md rounded-2xl p-3 border border-white/60 dark:border-white/10 shadow-sm text-center transform translate-y-1">
                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Est. Value</div>
                <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#7A5CFF]">₹38,500</div>
              </div>
            </div>
            
            {/* Floating Chips */}
            <div className="absolute top-12 -left-6 lg:-left-12 z-20 glass-panel bg-white/70 dark:bg-[#151C3E]/80 py-2 px-3 lg:px-4 rounded-xl text-[10px] lg:text-xs font-bold shadow-lg animate-float text-foreground flex items-center gap-1.5" style={{ animationDelay: '1s', transform: 'translateZ(50px)' }}>
              <span className="text-base leading-none">✨</span> Instant Quote
            </div>
            <div className="absolute bottom-24 -right-4 lg:-right-8 z-20 glass-panel bg-white/70 dark:bg-[#151C3E]/80 py-2 px-3 lg:px-4 rounded-xl text-[10px] lg:text-xs font-bold shadow-lg animate-float text-foreground flex items-center gap-1.5" style={{ animationDelay: '1.5s', transform: 'translateZ(80px)' }}>
              <span className="text-base leading-none">🚚</span> Free Pickup
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
