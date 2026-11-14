import { Link } from "@tanstack/react-router";

import { WHATSAPP_DISPLAY, WHATSAPP_HELP_MESSAGE, whatsappLink } from "@/lib/store-info";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-hero">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold">Mystic Resin Art</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Handmade resin art — artistic, personalised and decorative pieces.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm">
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/custom-order">Custom Order</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="text-sm">
          <p className="font-semibold">WhatsApp</p>
          <a className="text-muted-foreground hover:text-foreground" href={whatsappLink(WHATSAPP_HELP_MESSAGE)} target="_blank" rel="noreferrer">
            {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
      <div className="gold-rule mx-auto max-w-6xl" />
      <p className="py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Mystic Resin Art · Handmade in India</p>
    </footer>
  );
}
