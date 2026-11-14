import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { WHATSAPP_DISPLAY, WHATSAPP_HELP_MESSAGE, whatsappLink } from "@/lib/store-info";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mystic Resin Art" },
      { name: "description", content: `Contact Mystic Resin Art on WhatsApp at ${WHATSAPP_DISPLAY}.` },
      { property: "og:title", content: "Contact Mystic Resin Art" },
      { property: "og:description", content: `Reach Mystic Resin Art on WhatsApp at ${WHATSAPP_DISPLAY}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <PageHeader eyebrow="Say hello" title="Contact us" />
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-3xl border border-gold/40 bg-card p-8 text-center shadow-soft">
          <p className="text-muted-foreground">Contact Mystic Resin Art through WhatsApp at</p>
          <p className="font-display mt-2 text-4xl font-semibold">{WHATSAPP_DISPLAY}</p>
          <Button asChild variant="whatsapp" size="lg" className="mt-6">
            <a href={whatsappLink(WHATSAPP_HELP_MESSAGE)} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}
