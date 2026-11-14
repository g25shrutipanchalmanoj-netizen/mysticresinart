import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/data/products";
import { useCart } from "@/lib/cart";
import { UPI_ID, UPI_IS_PLACEHOLDER, upiPayLink, whatsappLink } from "@/lib/store-info";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Mystic Resin Art" },
      { name: "description", content: "Complete your Mystic Resin Art order with UPI payment." },
      { property: "og:title", content: "Checkout — Mystic Resin Art" },
      { property: "og:description", content: "Pay for your handmade resin order with UPI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, total } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", pincode: "", upiRef: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const detailsReady = form.name.trim() && form.phone.trim().length >= 10 && form.address.trim() && form.pincode.trim().length >= 6;

  if (!items.length) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Your cart is empty" />
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <Button asChild>
            <Link to="/shop">Browse the shop</Link>
          </Button>
        </div>
      </>
    );
  }

  const summary = items.map((i) => `• ${i.product.name} (ID ${i.product.id}) × ${i.qty} — ${formatPrice(i.lineTotal)}`).join("\n");
  const orderMessage = [
    "Hello Mystic Resin Art, I'd like to confirm my order.",
    "",
    summary,
    `Total: ${formatPrice(total)}`,
    "",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Address: ${form.address}, ${form.pincode}`,
    form.upiRef ? `UPI transaction ID: ${form.upiRef}` : "UPI transaction ID: (to be shared)",
    "",
    "Please verify my payment.",
  ].join("\n");

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Pay with UPI">
        Your order is confirmed once Mystic Resin Art verifies your payment.
      </PageHeader>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold">1. Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={set("name")} maxLength={80} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input id="phone" inputMode="tel" value={form.phone} onChange={set("phone")} maxLength={15} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={form.address} onChange={set("address")} maxLength={300} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pincode">PIN code</Label>
                <Input id="pincode" inputMode="numeric" value={form.pincode} onChange={set("pincode")} maxLength={6} />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold">2. Pay {formatPrice(total)} with UPI</h2>
            {UPI_IS_PLACEHOLDER && (
              <p className="mt-3 rounded-2xl bg-gold-soft p-3 text-sm text-gold-foreground">
                The store's UPI ID hasn't been set up yet — please don't pay until it's updated.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-border px-4 py-2 font-mono text-sm">{UPI_ID}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(UPI_ID);
                  toast.success("UPI ID copied");
                }}
              >
                <Copy /> Copy
              </Button>
            </div>
            <Button asChild className="mt-4" disabled={!detailsReady}>
              <a href={detailsReady ? upiPayLink(total, "Mystic Resin Art order") : undefined} aria-disabled={!detailsReady}>
                <Smartphone /> Open UPI app
              </a>
            </Button>
            {!detailsReady && <p className="mt-2 text-xs text-muted-foreground">Fill in your delivery details first.</p>}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold">3. Share your payment for verification</h2>
            <div className="mt-4 grid gap-1.5">
              <Label htmlFor="upiRef">UPI transaction ID (after paying)</Label>
              <Input id="upiRef" value={form.upiRef} onChange={set("upiRef")} maxLength={40} />
            </div>
            <Button asChild variant="whatsapp" className="mt-4" disabled={!detailsReady}>
              <a href={detailsReady ? whatsappLink(orderMessage) : undefined} target="_blank" rel="noreferrer">
                Send order details on WhatsApp
              </a>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Payment isn't marked as received until Mystic Resin Art checks it.
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-gold/40 bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {items.map((i) => (
              <li key={i.product.id} className="flex justify-between gap-3">
                <span>
                  {i.product.name} × {i.qty}
                </span>
                <span className="font-semibold">{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="gold-rule my-4" />
          <div className="flex justify-between text-lg">
            <span>Total</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </>
  );
}
