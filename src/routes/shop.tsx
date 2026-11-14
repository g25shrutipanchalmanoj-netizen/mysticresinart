import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, getCategory, PRODUCTS, type CategorySlug } from "@/data/products";
import { cn } from "@/lib/utils";

interface ShopSearch {
  category?: CategorySlug;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const raw = search["category"];
    const c = typeof raw === "string" ? getCategory(raw) : undefined;
    return c ? { category: c.slug } : {};
  },
  head: () => ({
    meta: [
      { title: "Shop Handmade Resin Jewellery — Mystic Resin Art" },
      { name: "description", content: "Browse all handmade resin earrings, rings, necklaces, bracelets and keychains with prices in ₹." },
      { property: "og:title", content: "Shop — Mystic Resin Art" },
      { property: "og:description", content: "Browse all handmade resin pieces from Mystic Resin Art." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const list = PRODUCTS.filter((p) => !category || p.category === category).sort((a, b) => a.price - b.price);
  const title = category ? getCategory(category)!.name : "Shop all";
  return (
    <>
      <PageHeader eyebrow="The collection" title={title}>
        Every piece is handmade in resin. Prices in ₹.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          <Link to="/shop" className={cn("rounded-full border px-4 py-1.5 text-sm", !category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-gold")}>
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className={cn("rounded-full border px-4 py-1.5 text-sm", category === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-gold")}
            >
              {c.name}
            </Link>
          ))}
        </div>
        {list.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted-foreground">No pieces in this category yet.</p>
        )}
      </div>
    </>
  );
}
