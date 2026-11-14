/**
 * AI response layer (server-only). Uses the Lovable AI Gateway; the key is read
 * from the server environment by the SDK and never reaches the browser.
 *
 * CONFIGURATION POINT: change ASSISTANT_MODEL to switch models.
 * The model only interprets the request and picks filters / product IDs from the
 * real catalogue — product cards, prices and cart totals always come from app data.
 */
import { generateResponse } from "@lovable.dev/ai-gateway";

import { CATEGORIES, PRODUCTS, productPath } from "@/data/products";
import { STORE_NAME, WHATSAPP_DISPLAY } from "@/lib/store-info";

import { FAQ } from "./faq";
import { INTENTS, NAV_TARGETS, type ChatTurn } from "./types";

export const ASSISTANT_MODEL = "openai/gpt-6-astra" as const;

export interface AiDecision {
  reply: string;
  intent: (typeof INTENTS)[number];
  filters: {
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    aroundPrice: number | null;
    customizableOnly: boolean;
  };
  productIds: string[];
  reasons: { productId: string; reason: string }[];
  actions: { target: (typeof NAV_TARGETS)[number]; category: string | null }[];
  needsBudget: boolean;
  quickReplies: string[];
}

const nullableNumber = { type: ["number", "null"] };

const DECISION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "intent", "filters", "productIds", "reasons", "actions", "needsBudget", "quickReplies"],
  properties: {
    reply: { type: "string", description: "Short friendly reply, 1-2 sentences." },
    intent: { type: "string", enum: [...INTENTS] },
    filters: {
      type: "object",
      additionalProperties: false,
      required: ["category", "minPrice", "maxPrice", "aroundPrice", "customizableOnly"],
      properties: {
        category: { type: ["string", "null"], enum: [...CATEGORIES.map((c) => c.slug), null] },
        minPrice: nullableNumber,
        maxPrice: nullableNumber,
        aroundPrice: nullableNumber,
        customizableOnly: { type: "boolean" },
      },
    },
    productIds: { type: "array", items: { type: "string" } },
    reasons: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["productId", "reason"],
        properties: { productId: { type: "string" }, reason: { type: "string" } },
      },
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["target", "category"],
        properties: {
          target: { type: "string", enum: [...NAV_TARGETS] },
          category: { type: ["string", "null"], enum: [...CATEGORIES.map((c) => c.slug), null] },
        },
      },
    },
    needsBudget: { type: "boolean" },
    quickReplies: { type: "array", items: { type: "string" } },
  },
} as const;

function systemPrompt(): string {
  const catalogue = PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    price_inr: p.price,
    category: p.category,
    customizable: p.customizable,
    url: productPath(p.id),
  }));
  return `You are Mystic Assistant, the shopping assistant for ${STORE_NAME}, an Indian handmade resin-art store.
Personality: friendly, polite, short and clear, simple English, not robotic. Replies are 1-2 short sentences. Use ₹ for prices.

PRODUCT CATALOGUE (the ONLY products that exist; JSON):
${JSON.stringify(catalogue)}

CATEGORIES: ${CATEGORIES.map((c) => `${c.slug} (${c.name})`).join(", ")}

FAQ (use these answers):
- What is Mystic Resin Art? ${FAQ.about}
- Normal order: ${FAQ.normalOrder}
- Custom order: ${FAQ.customOrder}
- WhatsApp number: ${WHATSAPP_DISPLAY}
- Can I customize? ${FAQ.customize}
- Contact: ${FAQ.contact}

HOW TO RESPOND
- The app shows product cards (image, name, price, buttons) for productIds or for filters you set. Do NOT list products or prices in "reply" — say a short lead-in like "Sure! Here are some earrings under ₹150:".
- For product searches set "filters" (category/minPrice/maxPrice/aroundPrice/customizableOnly). Combine conditions from the whole conversation (e.g. earlier "earrings" + now "under 150").
- Use "productIds" only for specific products the customer named or asked about by ID, or for a hand-picked recommendation. Only use IDs from the catalogue.
- "reasons": optional short reason per recommended product, based ONLY on catalogue fields (e.g. customizable → "can be personalised"). Never invent materials, sizes, colours or features.
- If a gift or category request has no budget yet, ask "What's your budget?" and set needsBudget=true, with no products.
- Vague cheap requests ("something cheap for my friend") → gift intent with maxPrice 100.
- Custom/personalised requests (name, initials, custom design): reply "${FAQ.customIntro}", intent custom_order, actions custom_order, and set filters.customizableOnly=true to show personalisable products.
- Custom orders ONLY go through WhatsApp via the Custom Order page. Never put custom orders in the cart.
- Normal purchase: Product page → Add to Cart → Checkout → UPI payment.
- Cart questions: intent cart_view / cart_total / cart_remove; the app shows the real cart, so never state cart totals or contents yourself. "Take me to checkout" → intent checkout.
- Navigation buttons go in "actions" (shop with optional category, categories, custom_order, cart, checkout, about, contact, whatsapp).
- quickReplies: up to 4 short follow-up suggestions, or [] .
- NEVER invent products, prices, stock, discounts, reviews, shipping times or specifications. NEVER say a payment succeeded or an order was placed.
- If information is not available, reply exactly: "${FAQ.unknown}" with action whatsapp.`;
}

function toInput(history: ChatTurn[]) {
  return history.map((turn) => ({
    role: turn.role,
    content:
      turn.role === "assistant" && turn.productIds?.length
        ? `${turn.text}\n[Products shown: ${turn.productIds.join(", ")}]`
        : turn.text,
  }));
}

export async function askAi(history: ChatTurn[], cartSummary: string): Promise<AiDecision> {
  const response = await generateResponse({
    model: ASSISTANT_MODEL,
    instructions: `${systemPrompt()}\n\nCURRENT CART (for context only): ${cartSummary}`,
    input: toInput(history),
    reasoning: { effort: "low" },
    text: {
      format: { type: "json_schema", name: "assistant_decision", strict: true, schema: DECISION_SCHEMA },
    },
  });

  let raw = "";
  for (const item of response.output ?? []) {
    if (item.type === "message") {
      for (const part of item.content) if (part.type === "output_text") raw += part.text;
    }
  }
  if (!raw) throw new Error("Empty AI response");
  return JSON.parse(raw) as AiDecision;
}
