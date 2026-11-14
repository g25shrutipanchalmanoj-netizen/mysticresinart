import type { CategorySlug } from "@/data/products";

export const NAV_TARGETS = [
  "shop",
  "categories",
  "custom_order",
  "cart",
  "checkout",
  "about",
  "contact",
  "whatsapp",
] as const;
export type NavTarget = (typeof NAV_TARGETS)[number];

export interface NavAction {
  target: NavTarget;
  category?: CategorySlug | undefined;
}

export const INTENTS = [
  "greeting",
  "product_search",
  "category_search",
  "price_search",
  "gift",
  "custom_order",
  "product_details",
  "find_product",
  "cart_view",
  "cart_total",
  "cart_remove",
  "checkout",
  "contact",
  "faq",
  "clarify",
  "unknown",
] as const;
export type Intent = (typeof INTENTS)[number];

export interface SearchFilters {
  category?: CategorySlug | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  aroundPrice?: number | undefined;
  customizableOnly?: boolean | undefined;
}

/** Short-term memory carried between turns (session only). */
export interface ConversationContext {
  filters?: SearchFilters | undefined;
  gift?: boolean | undefined;
  awaiting?: "budget" | undefined;
}

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
  productIds?: string[] | undefined;
}

export interface AssistantReply {
  text: string;
  intent: Intent;
  productIds: string[];
  reasons: Record<string, string>;
  actions: NavAction[];
  quickReplies: string[];
  showCart: boolean;
  context: ConversationContext;
  mode: "ai" | "fallback";
  notice?: string | undefined;
}

export const BUDGET_CHIPS = ["Under ₹100", "₹100–₹200", "₹200–₹500", "₹500+"];
export const FALLBACK_NOTICE =
  "I'm having trouble with my smart assistant right now, but I can still help you browse our products.";
