import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircleHeart } from "lucide-react";

import hero from "@/assets/hero-resin.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS, productsInCategory } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mystic Resin Art — Handmade Resin Jewellery & Personalised Gifts" },
      { name: "description", content: "Shop handmade resin earrings, rings, necklaces, bracelets and personalised keychains. Custom designs on WhatsApp." },
      { property: "og:title", content: "Mystic Resin Art — Handmade Resin Jewellery & Gifts" },
      { property: "og:description", content: "Handmade resin jewellery and personalised gifts, with custom designs on request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = [...PRODUCTS].slice(0, 4);
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={hero} alt="" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-foreground">Handmade resin art</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.05] md:text-7xl">
            Little pieces of <span className="text-gold-gradient italic">magic</span>, poured by hand.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Earrings, rings, necklaces, bracelets and keychains — many can be personalised just for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/shop">
                Shop the collection <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/custom-order">Create a custom order</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-4xl font-semibold">Shop by category</h2>
          <Link to="/categories" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            All categories
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className={`group rounded-3xl border border-border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-soft ${i % 2 ? "bg-sky" : "bg-blush"}`}
            >
              <span className="font-display text-2xl font-semibold">{c.name}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{productsInCategory(c.slug).length} pieces</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-4xl font-semibold">Customer favourites</h2>
          <Link to="/shop" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="bg-hero flex flex-col items-start gap-6 rounded-[2rem] border border-gold/40 p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-4xl font-semibold">Want something made just for you?</h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Names, initials, colours or a completely new design — send your idea and we'll talk it through on WhatsApp.
            </p>
          </div>
          <Button asChild variant="gold" size="lg">
            <Link to="/custom-order">
              <MessageCircleHeart /> Start a custom order
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
