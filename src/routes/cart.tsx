import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { ProductImage } from "@/components/site/ProductImage";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Mystic Resin Art" },
      { name: "description", content: "Review the handmade resin pieces in your cart before checkout." },
      { property: "og:title", content: "Your Cart — Mystic Resin Art" },
      { property: "og:description", content: "Review your cart and continue to UPI checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, setQty, remove } = useCart();
  return (
    <>
      <PageHeader eyebrow="Your bag" title="Cart" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-lg">Your cart is empty.</p>
            <Button asChild className="mt-5">
              <Link to="/shop">Browse the shop</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_280px]">
            <ul className="flex flex-col gap-4">
              {items.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="flex gap-4 rounded-3xl border border-border bg-card p-4">
                  <Link to="/product/$productId" params={{ productId: product.id }} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                    <ProductImage product={product} compact />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <Link to="/product/$productId" params={{ productId: product.id }} className="font-display text-xl font-semibold leading-tight">
                      {product.name}
                    </Link>
                    <span className="text-sm text-muted-foreground">{formatPrice(product.price)} each</span>
                    <div className="mt-auto flex items-center gap-2">
                      <Button size="icon-sm" variant="outline" aria-label="Decrease quantity" onClick={() => setQty(product.id, qty - 1)}>
                        <Minus />
                      </Button>
                      <span className="w-6 text-center font-semibold">{qty}</span>
                      <Button size="icon-sm" variant="outline" aria-label="Increase quantity" onClick={() => setQty(product.id, qty + 1)}>
                        <Plus />
                      </Button>
                      <Button size="sm" variant="ghost" className="ml-auto" onClick={() => remove(product.id)}>
                        <Trash2 /> Remove
                      </Button>
                    </div>
                  </div>
                  <span className="font-bold">{formatPrice(lineTotal)}</span>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-3xl border border-gold/40 bg-card p-6 shadow-soft">
              <div className="flex justify-between text-lg">
                <span>Total</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
              <Button asChild className="mt-5 w-full" size="lg">
                <Link to="/checkout">Checkout with UPI</Link>
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">Custom designs are ordered on WhatsApp, not through the cart.</p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
