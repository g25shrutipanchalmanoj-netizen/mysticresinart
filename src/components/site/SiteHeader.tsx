import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";

import logo from "@/assets/mystic-assistant-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/custom-order", label: "Custom Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" width={256} height={256} className="h-9 w-9" />
          <span className="font-display text-2xl font-semibold">Mystic Resin Art</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" aria-label={`Cart, ${count} items`} className="relative">
            <Link to="/cart">
              <ShoppingBag />
              {count > 0 && (
                <span className="bg-gold-gradient absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-gold-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <SheetTitle className="font-display text-2xl">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-4 text-lg">
                {[...NAV, { to: "/cart", label: "Cart" } as const].map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
                    {n.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
