import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mystic Resin Art" },
      { name: "description", content: "Mystic Resin Art is a handmade resin-art brand offering artistic, personalised and decorative resin products." },
      { property: "og:title", content: "About Mystic Resin Art" },
      { property: "og:description", content: "A handmade resin-art brand making artistic, personalised and decorative pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="About Mystic Resin Art" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-lg leading-relaxed">
        <p>
          Mystic Resin Art is a handmade resin-art brand offering artistic, personalised and decorative resin products — from
          earrings and rings to necklaces, bracelets and keychains.
        </p>
        <p className="mt-5 text-muted-foreground">
          Shop ready-made pieces with UPI checkout, or send us your own idea through a custom order on WhatsApp.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link to="/shop">Shop now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/custom-order">Custom order</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
