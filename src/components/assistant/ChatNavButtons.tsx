import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getCategory } from "@/data/products";
import type { NavAction } from "@/lib/assistant/types";
import { WHATSAPP_HELP_MESSAGE, whatsappLink } from "@/lib/store-info";

export function ChatNavButtons({ actions, onNavigate }: { actions: NavAction[]; onNavigate: () => void }) {
  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((a, i) => {
        const key = `${a.target}-${a.category ?? ""}-${i}`;
        switch (a.target) {
          case "shop":
            return (
              <Button key={key} asChild size="xs" variant="chip">
                {a.category ? (
                  <Link to="/shop" search={{ category: a.category }} onClick={onNavigate}>
                    See all {getCategory(a.category)?.name.toLowerCase()}
                  </Link>
                ) : (
                  <Link to="/shop" onClick={onNavigate}>
                    Open shop
                  </Link>
                )}
              </Button>
            );
          case "categories":
            return (
              <Button key={key} asChild size="xs" variant="chip">
                <Link to="/categories" onClick={onNavigate}>Categories</Link>
              </Button>
            );
          case "custom_order":
            return (
              <Button key={key} asChild size="xs" variant="gold">
                <Link to="/custom-order" onClick={onNavigate}>Create Custom Order</Link>
              </Button>
            );
          case "cart":
            return (
              <Button key={key} asChild size="xs" variant="chip">
                <Link to="/cart" onClick={onNavigate}>Cart</Link>
              </Button>
            );
          case "checkout":
            return (
              <Button key={key} asChild size="xs" variant="chip">
                <Link to="/checkout" onClick={onNavigate}>Checkout</Link>
              </Button>
            );
          case "about":
            return (
              <Button key={key} asChild size="xs" variant="chip">
                <Link to="/about" onClick={onNavigate}>About</Link>
              </Button>
            );
          case "contact":
            return (
              <Button key={key} asChild size="xs" variant="chip">
                <Link to="/contact" onClick={onNavigate}>Contact</Link>
              </Button>
            );
          case "whatsapp":
            return (
              <Button key={key} asChild size="xs" variant="whatsapp">
                <a href={whatsappLink(WHATSAPP_HELP_MESSAGE)} target="_blank" rel="noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            );
        }
      })}
    </div>
  );
}
