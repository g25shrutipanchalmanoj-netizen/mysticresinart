/**
 * Chat service (server boundary). Calls the AI layer, then grounds the result in
 * the real catalogue. Falls back to the rule-based engine if AI is unavailable.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getProduct, PRODUCTS, type CategorySlug } from "@/data/products";

import { askAi } from "./ai.server";
import { runFallback } from "./engine";
import { closestProducts, describeFilters, hasFilters, searchProducts } from "./search";
import {
  BUDGET_CHIPS,
  FALLBACK_NOTICE,
  type AssistantReply,
  type ConversationContext,
  type Intent,
  type NavAction,
  type SearchFilters,
} from "./types";

const inputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(2000),
        productIds: z.array(z.string().max(20)).max(12).optional(),
      }),
    )
    .min(1)
    .max(30),
  cart: z.array(z.object({ id: z.string().max(20), qty: z.number().int().min(1).max(99) })).max(50),
  context: z
    .object({
      filters: z.record(z.string(), z.unknown()).optional(),
      gift: z.boolean().optional(),
      awaiting: z.literal("budget").optional(),
    })
    .optional(),
});

const SEARCH_INTENTS: Intent[] = ["product_search", "category_search", "price_search", "gift", "custom_order"];
const CART_INTENTS: Intent[] = ["cart_view", "cart_total", "cart_remove", "checkout"];

export const askMysticAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<AssistantReply> => {
    const history = data.history.slice(-16);
    const lastUser = [...history].reverse().find((t) => t.role === "user")?.text ?? "";
    const cartSummary = data.cart.length
      ? data.cart
          .map((l) => {
            const p = getProduct(l.id);
            return p ? `${l.qty} x ${p.name}` : null;
          })
          .filter(Boolean)
          .join(", ")
      : "empty";

    try {
      const d = await askAi(history, cartSummary);

      const isCategory = (c: string | null): c is CategorySlug => !!c && PRODUCTS.some((p) => p.category === c);
      const filters: SearchFilters = {
        category: isCategory(d.filters.category) ? d.filters.category : undefined,
        minPrice: d.filters.minPrice ?? undefined,
        maxPrice: d.filters.maxPrice ?? undefined,
        aroundPrice: d.filters.aroundPrice ?? undefined,
        customizableOnly: d.filters.customizableOnly || undefined,
      };

      // Only real catalogue IDs survive.
      let productIds = d.productIds.filter((id) => getProduct(id));
      let text = d.reply.trim();

      if (!d.needsBudget && !productIds.length && SEARCH_INTENTS.includes(d.intent) && hasFilters(filters)) {
        productIds = searchProducts(PRODUCTS, filters).map((p) => p.id);
        if (!productIds.length) {
          productIds = closestProducts(PRODUCTS, filters).map((p) => p.id);
          text = `I couldn't find ${describeFilters(filters, d.intent === "gift")} right now. Here are the closest options:`;
        }
      }
      if (d.needsBudget) productIds = [];

      const reasons: Record<string, string> = {};
      for (const r of d.reasons) if (productIds.includes(r.productId)) reasons[r.productId] = r.reason.slice(0, 140);

      const actions: NavAction[] = d.actions.map((a) => ({
        target: a.target,
        category: isCategory(a.category) ? a.category : undefined,
      }));
      if (d.intent === "custom_order" && !actions.some((a) => a.target === "custom_order"))
        actions.unshift({ target: "custom_order" });

      const context: ConversationContext = {
        filters,
        gift: d.intent === "gift" || undefined,
        awaiting: d.needsBudget ? "budget" : undefined,
      };

      return {
        text,
        intent: d.intent,
        productIds: productIds.slice(0, 6),
        reasons,
        actions: actions.slice(0, 4),
        quickReplies: d.needsBudget ? BUDGET_CHIPS : d.quickReplies.slice(0, 4).map((q) => q.slice(0, 40)),
        showCart: CART_INTENTS.includes(d.intent),
        context,
        mode: "ai",
      };
    } catch (error) {
      console.error("Mystic Assistant AI unavailable, using fallback:", error);
      const r = runFallback(lastUser, data.context as ConversationContext | undefined);
      return { ...r, mode: "fallback", notice: FALLBACK_NOTICE };
    }
  });
