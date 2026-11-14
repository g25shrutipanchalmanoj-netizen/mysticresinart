import { createFileRoute } from "@tanstack/react-router";
import { MessageCircleHeart } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, getProduct } from "@/data/products";
import { buildCustomOrderMessage } from "@/lib/custom-order";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/store-info";

interface CustomSearch {
  product?: string;
}

export const Route = createFileRoute("/custom-order")({
  validateSearch: (search: Record<string, unknown>): CustomSearch => {
    const raw = search["product"];
    const id = typeof raw === "string" || typeof raw === "number" ? String(raw) : undefined;
    return id && getProduct(id) ? { product: id } : {};
  },
  head: () => ({
    meta: [
      { title: "Custom Order on WhatsApp — Mystic Resin Art" },
      { name: "description", content: "Request a personalised or fully custom resin piece. Your requirements are sent to Mystic Resin Art on WhatsApp." },
      { property: "og:title", content: "Custom Order — Mystic Resin Art" },
      { property: "og:description", content: "Send your custom resin design request on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomOrder,
});

function CustomOrder() {
  const { product } = Route.useSearch();
  const ref = product ? getProduct(product) : undefined;
  const [f, setF] = useState({
    name: "",
    phone: "",
    type: ref ? (CATEGORIES.find((c) => c.slug === ref.category)?.name ?? "") : "",
    reference: ref ? `${ref.name} (ID ${ref.id})` : "",
    text: "",
    colours: "",
    budget: "",
    date: "",
    details: "",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));
  const ready = f.name.trim() && (f.details.trim() || f.text.trim());

  return (
    <>
      <PageHeader eyebrow="Made for you" title="Custom Order">
        Tell us what you'd love. Your request opens in WhatsApp, sent to {WHATSAPP_DISPLAY}. Custom orders aren't paid through the cart.
      </PageHeader>
      <form
        className="mx-auto grid max-w-3xl gap-5 px-4 py-10 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          window.open(whatsappLink(buildCustomOrderMessage(f)), "_blank", "noopener");
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="name">Your name *</Label>
          <Input id="name" value={f.name} onChange={set("name")} maxLength={80} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" inputMode="tel" value={f.phone} onChange={set("phone")} maxLength={15} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="type">Product type</Label>
          <select
            id="type"
            value={f.type}
            onChange={set("type")}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="">Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug}>{c.name}</option>
            ))}
            <option>Something else</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="reference">Based on a product (optional)</Label>
          <Input id="reference" value={f.reference} onChange={set("reference")} maxLength={120} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="text">Name / initials / text</Label>
          <Input id="text" value={f.text} onChange={set("text")} maxLength={60} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="colours">Colours or theme</Label>
          <Input id="colours" value={f.colours} onChange={set("colours")} maxLength={100} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="budget">Budget (₹)</Label>
          <Input id="budget" value={f.budget} onChange={set("budget")} maxLength={20} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="date">Needed by</Label>
          <Input id="date" type="date" value={f.date} onChange={set("date")} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="details">Describe your idea *</Label>
          <Textarea id="details" rows={5} value={f.details} onChange={set("details")} maxLength={1000} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" variant="whatsapp" size="lg" disabled={!ready}>
            <MessageCircleHeart /> Send on WhatsApp
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">We'll reply on WhatsApp to confirm details and price.</p>
        </div>
      </form>
    </>
  );
}
