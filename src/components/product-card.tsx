import { Link } from "@tanstack/react-router";
import { Heart, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inr, type Product } from "@/lib/mock-data";
import { useShop } from "@/contexts/shop-context";

export function ProductCard({ p }: { p: Product }) {
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const { toggleWishlist, isInWishlist } = useShop();
  
  // Randomly assign "Best seller" to some items based on ID to simulate the design
  const isBestSeller = parseInt(p.id) % 3 === 0;
  const isHearted = isInWishlist(p.id);

  return (
    <Link
      to="/buy/$id"
      params={{ id: p.slug }}
      className="group relative flex flex-col h-full bg-white dark:bg-[#1C1C24] rounded-3xl p-5 hover:shadow-glow-blue hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300"
    >
      <div className="relative aspect-[4/5] bg-[#F8F9FD] dark:bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center mb-4">
        <img src={p.image} alt={p.model} loading="lazy"
          className="h-[85%] w-auto object-contain transition-all duration-500 group-hover:scale-[1.05] drop-shadow-md" />
        
        {isBestSeller && (
          <Badge variant="secondary" className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-primary to-[#7A5CFF] text-white border-0 text-[10px] font-bold py-1 px-2.5 shadow-sm">
            Best seller
          </Badge>
        )}
        
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
          className="absolute top-2 right-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 h-8 w-8 transition-all duration-300 text-muted-foreground hover:text-foreground z-10"
        >
          <Heart className={`h-4 w-4 stroke-[1.5] transition-colors ${isHearted ? 'fill-red-500 stroke-red-500' : ''}`} />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-start text-left gap-1">
        <div className="font-bold text-[15px] leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">{p.model}</div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[17px] font-bold tracking-tight text-foreground">{inr(p.price)}</span>
          <span className="text-[11px] text-muted-foreground/60 line-through font-medium">{inr(p.mrp)}</span>
          <span className="text-[10px] text-primary font-bold flex items-center bg-primary/5 px-1.5 py-0.5 rounded ml-1"><Tag className="h-2.5 w-2.5 mr-0.5" /> {off}%</span>
        </div>
        
        <div className="flex items-center gap-1.5 mt-auto pt-3 text-[11px] font-medium text-muted-foreground w-full">
          <span>{p.storage}</span>
          <span className="h-1 w-1 rounded-full bg-border"></span>
          <span>{p.condition}</span>
          <span className="ml-auto font-semibold text-foreground/80">~{inr(p.mrp - p.price)}</span>
        </div>
      </div>
    </Link>
  );
}
