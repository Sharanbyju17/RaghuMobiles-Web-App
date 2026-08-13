import { Link, useRouterState } from "@tanstack/react-router";
import logoUrl from "@/assets/Images/logo.png";
import { Menu, ShoppingBag, Heart, User, Search, Moon, Sun, Instagram, Twitter, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { useShop } from "@/contexts/shop-context";

const nav = [
  { to: "/", label: "Home" },
  { to: "/buy", label: "Buy Mobiles" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useShop();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const { theme, setTheme } = useTheme();

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-[24px] border-b border-white/40 shadow-sm' : 'bg-transparent border-transparent'}`}>
      <div className="container-page flex h-20 items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img src={logoUrl} alt="Raghu Mobiles" className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="font-semibold tracking-tight text-[15px]">Raghu Mobiles</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 mx-auto bg-white/40 dark:bg-black/20 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/40 shadow-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`relative px-4 py-1.5 text-[13px] rounded-full font-medium transition-all duration-300 ${isActive(n.to) ? "text-[#7A5CFF] bg-[#EAEBFF] dark:bg-[#7A5CFF]/20" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-transform duration-300 hover:scale-105"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 stroke-[1.5]" /> : <Moon className="h-4 w-4 stroke-[1.5]" />}
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-transform duration-300 hover:scale-105" asChild>
            <Link to="/buy"><Search className="h-4 w-4 stroke-[1.5]" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-transform duration-300 hover:scale-105" asChild>
            <Link to="/wishlist"><Heart className="h-4 w-4 stroke-[1.5]" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-white/50 dark:hover:bg-white/10 transition-transform duration-300 hover:scale-105" asChild>
            <Link to="/cart">
              <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] font-semibold grid place-items-center border-2 border-background">{cartCount}</span>
              )}
            </Link>
          </Button>

          {user ? (
            <div className="flex items-center gap-2 relative group">
              <Link to="/" className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20 transition-colors">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </Link>
              {/* Dropdown can go here if needed, or simple logout on click */}
              <div className="absolute right-0 top-full mt-2 w-32 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-transform duration-300 hover:scale-105" asChild>
              <Link to="/login"><User className="h-4 w-4 stroke-[1.5]" /></Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {nav.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm ${isActive(n.to) ? "bg-secondary" : "hover:bg-secondary"}`}>
                    {n.label}
                  </Link>
                ))}
                <Link to="/admin" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm text-muted-foreground">Admin Console</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 pt-16 pb-8 border-t border-border/20 bg-background relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-page grid gap-12 md:grid-cols-4 relative z-10">
        <div className="space-y-5">
          <div className="flex items-center gap-2 group">
            <img src={logoUrl} alt="Raghu Mobiles" className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105" />
            <span className="font-semibold tracking-tight text-lg">Raghu Mobiles</span>
          </div>
          <p className="text-sm text-muted-foreground/80 max-w-xs leading-relaxed">Certified pre-owned smartphones. Rigorously tested, warranted, and delivered with care.</p>
          <div className="flex gap-3 pt-2">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="grid place-items-center h-10 w-10 rounded-full bg-secondary/50 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:shadow-glow-blue transition-all duration-300 hover:-translate-y-1">
                <Icon className="h-4 w-4 stroke-[1.5]" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-foreground tracking-wider mb-5">Shop</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/buy" className="text-muted-foreground/80 hover:text-primary transition-colors">Buy Mobiles</Link></li>
            <li><Link to="/wishlist" className="text-muted-foreground/80 hover:text-primary transition-colors">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-foreground tracking-wider mb-5">Company</div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="text-muted-foreground/80 hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/contact" className="text-muted-foreground/80 hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/admin" className="text-muted-foreground/80 hover:text-primary transition-colors">Admin Console</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold text-foreground tracking-wider mb-5">Contact Us</div>
          <div className="text-sm text-muted-foreground/80 space-y-3">
            <p className="leading-relaxed">2nd Floor, RR Complex,<br />Erode Fort, Erode,<br />Tamil Nadu 638001</p>
            <div className="pt-2 flex flex-col gap-2">
              <a href="tel:+919698237458" className="hover:text-primary transition-colors font-medium text-foreground">+91 96982 37458</a>
              <a href="mailto:raghu25dharmalingam@gmail.com" className="hover:text-primary transition-colors">raghu25dharmalingam@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page mt-20 pt-6 border-t border-border/30 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground/60">
          <span>© 2026 Raghu Mobiles. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
