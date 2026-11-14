import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";

/** Shows the real cart state inside the chat. */
export function ChatCartSummary({ onNavigate }: { onNavigate: () => void }) {
  const { items, total, count } = useCart();
  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-border bg-card p-3 text-sm text-muted-foreground">Your cart is empty.</p>;
  }
  return (
    <div className="rounded-2xl border border-gold/40 bg-card p-3 text-sm shadow-soft">
      <ul className="flex flex-col gap-1.5">
        {items.map((i) => (
          <li key={i.product.id} className="flex justify-between gap-3">
            <span className="min-w-0">
              {i.product.name} × {i.qty}
            </span>
            <span className="shrink-0 font-semibold">{formatPrice(i.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="gold-rule my-2.5" />
      <div className="flex justify-between font-semibold">
        <span>
          Total ({count} item{count === 1 ? "" : "s"})
        </span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button asChild size="xs" variant="outline">
          <Link to="/cart" onClick={onNavigate}>
            Edit cart
          </Link>
        </Button>
        <Button asChild size="xs">
          <Link to="/checkout" onClick={onNavigate}>
            Checkout
          </Link>
        </Button>
      </div>
    </div>
  );
}
