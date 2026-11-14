/**
 * Rule-based assistant engine. Used as the fallback when the AI service is
 * unavailable, and as the deterministic parser for prices/categories.
 * Always works from the real catalogue — it never invents products or prices.
 */
import { getProduct, PRODUCTS, type CategorySlug, type Product } from "@/data/products";

import { FAQ, WELCOME_MESSAGE, WELCOME_QUICK_REPLIES } from "./faq";
import {
  closestProducts,
  describeFilters,
  hasFilters,
  recommendationReasons,
  searchProducts,
} from "./search";
import {
  BUDGET_CHIPS,
  type AssistantReply,
  type ConversationContext,
  type NavAction,
  type SearchFilters,
} from "./types";

type Reply = Omit<AssistantReply, "mode">;

const CATEGORY_PATTERNS: [CategorySlug, RegExp][] = [
  ["earrings", /\b(ear\s?rings?|jhumk(a|as|i|is)|dangles?|studs?|hoops?)\b/],
  ["rings", /\b(rings?|finger ring)\b/],
  ["keychains", /\b(key\s?chains?|key\s?rings?|keyrings?)\b/],
  ["necklaces", /\b(necklaces?|pendants?|neck\s?piece)\b/],
  ["bracelets", /\b(bracelets?|bangles?|wrist)\b/],
];

const NAME_STOPWORDS = new Set([
  "resin", "custom", "personalized", "personalised", "name", "initial", "earrings", "ring",
  "keychain", "necklace", "bracelet", "the", "and",
]);

export function detectCategory(t: string): CategorySlug | undefined {
  // keyrings must not be read as rings
  for (const [slug, re] of CATEGORY_PATTERNS.filter(([s]) => s === "keychains")) if (re.test(t)) return slug;
  for (const [slug, re] of CATEGORY_PATTERNS) if (re.test(t)) return slug;
  return undefined;
}

const NUM = String.raw`(?:₹|rs\.?|inr)?\s*(\d{2,5})`;

export function parsePrice(t: string): Pick<SearchFilters, "minPrice" | "maxPrice" | "aroundPrice"> {
  const s = t.replace(/,/g, "");
  let m = s.match(new RegExp(String.raw`(?:between|from)\s*${NUM}\s*(?:and|to|-|–)\s*${NUM}`));
  if (m) return { minPrice: Number(m[1]), maxPrice: Number(m[2]) };
  m = s.match(new RegExp(String.raw`${NUM}\s*(?:-|–|—|to)\s*${NUM}`));
  if (m) return { minPrice: Number(m[1]), maxPrice: Number(m[2]) };
  m = s.match(new RegExp(String.raw`${NUM}\s*\+`));
  if (m) return { minPrice: Number(m[1]) };
  m = s.match(
    new RegExp(
      String.raw`(?:under|below|less than|within|upto|up to|max(?:imum)?|not more than|cheaper than|budget(?: is| of)?|<)\s*${NUM}`,
    ),
  );
  if (m) return { maxPrice: Number(m[1]) };
  m = s.match(new RegExp(String.raw`(?:above|over|more than|at least|min(?:imum)?|>)\s*${NUM}`));
  if (m) return { minPrice: Number(m[1]) };
  m = s.match(new RegExp(String.raw`(?:around|about|near|approx(?:imately)?|close to|roughly|~)\s*${NUM}`));
  if (m) return { aroundPrice: Number(m[1]) };
  m = s.match(/(?:₹|rs\.?|inr)\s*(\d{2,5})|(\d{2,5})\s*(?:rs|rupees|inr)\b/);
  if (m) return { aroundPrice: Number(m[1] ?? m[2]) };
  return {};
}

function matchProductsByName(t: string): { product: Product; score: number }[] {
  const words = new Set(t.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !NAME_STOPWORDS.has(w)));
  return PRODUCTS.map((product) => {
    const tokens = product.name.toLowerCase().split(/\s+/).filter((w) => !NAME_STOPWORDS.has(w));
    const score = tokens.filter((tok) => words.has(tok) || words.has(tok.replace(/s$/, ""))).length;
    return { product, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

function reply(partial: Partial<Reply> & { text: string; intent: Reply["intent"] }): Reply {
  return {
    productIds: [],
    reasons: {},
    actions: [],
    quickReplies: [],
    showCart: false,
    context: {},
    ...partial,
  };
}

const has = (t: string, re: RegExp) => re.test(t);

export function runFallback(input: string, context: ConversationContext = {}): Reply {
  const t = input.toLowerCase().trim();
  if (!t) return reply({ text: WELCOME_MESSAGE, intent: "greeting", quickReplies: WELCOME_QUICK_REPLIES });

  // Quick-reply buttons
  if (/^shop( products)?$|^(show|see|browse)( all| me all)?( the)? products$/.test(t)) {
    return showResults({}, false, "Here's everything in our shop right now:", [{ target: "shop" }]);
  }
  if (/^find a product$/.test(t)) {
    return reply({
      text: "Sure! What are you looking for? Pick a category or tell me your budget.",
      intent: "find_product",
      quickReplies: ["Earrings", "Rings", "Necklaces", "Bracelets", "Keychains", "Under ₹150"],
    });
  }
  if (/^help with cart$/.test(t)) {
    return reply({
      text: "Here's your cart:",
      intent: "cart_view",
      showCart: true,
      actions: [{ target: "cart" }, { target: "checkout" }],
    });
  }
  if (/^contact( us)?$/.test(t)) {
    return reply({ text: FAQ.contact, intent: "contact", actions: [{ target: "whatsapp" }, { target: "contact" }] });
  }

  if (/^(hi+|hello+|hey+|namaste|hola|good (morning|afternoon|evening))[!. ]*$/.test(t)) {
    return reply({ text: WELCOME_MESSAGE, intent: "greeting", quickReplies: WELCOME_QUICK_REPLIES });
  }

  // Product by ID
  const idMatch = t.match(/\b(1\d{4})\b/);
  if (idMatch) {
    const p = getProduct(idMatch[1] ?? "");
    if (p) return productDetails(p);
    if (/product|item|id|#/.test(t))
      return reply({
        text: `I couldn't find a product with ID ${idMatch[1]}. ${FAQ.unknown}`,
        intent: "product_details",
        actions: [{ target: "shop" }],
      });
  }

  // Cart & checkout
  if (has(t, /\b(remove|delete|take out|change quantity|reduce)\b/) && has(t, /\b(cart|item|something|product)\b/)) {
    return reply({
      text: "You can remove items or change quantities on your cart page. Here's what's in it now:",
      intent: "cart_remove",
      showCart: true,
      actions: [{ target: "cart" }],
    });
  }
  if (has(t, /\b(checkout|check out|pay now|proceed to pay|ready to pay)\b/)) {
    return reply({ text: "Taking you to checkout.", intent: "checkout", showCart: true, actions: [{ target: "checkout" }] });
  }
  if (has(t, /\bcart\b/) && has(t, /\b(how much|total|cost|amount|price)\b/)) {
    return reply({ text: "Here's your cart total:", intent: "cart_total", showCart: true, actions: [{ target: "checkout" }] });
  }
  if (has(t, /\b(cart|basket|bag)\b/)) {
    return reply({
      text: "Here's what's in your cart:",
      intent: "cart_view",
      showCart: true,
      actions: [{ target: "cart" }, { target: "checkout" }],
    });
  }

  // FAQ
  if (has(t, /what is mystic|who are you|about (mystic|you|the brand|your brand)|tell me about (mystic|your (shop|store|brand))/)) {
    return reply({ text: FAQ.about, intent: "faq", actions: [{ target: "about" }, { target: "shop" }] });
  }
  if (has(t, /how (do|can|to|should) (i )?(place|make|do)? ?(a |an )?(normal |regular )?(order|buy|purchase)|how to (order|buy|purchase)/)) {
    if (has(t, /custom|personali[sz]/))
      return reply({ text: FAQ.customOrder, intent: "faq", actions: [{ target: "custom_order" }, { target: "whatsapp" }] });
    return reply({ text: FAQ.normalOrder, intent: "faq", actions: [{ target: "shop" }, { target: "cart" }] });
  }
  if (has(t, /can i (customi[sz]e|personali[sz]e)( a| any| the)? (product|item|order)s?\b/)) {
    return reply({ text: FAQ.customize, intent: "faq", actions: [{ target: "custom_order" }] });
  }
  if (has(t, /whats ?app|phone|number|contact|call you|reach (you|out)|email|instagram/)) {
    return reply({ text: FAQ.contact, intent: "contact", actions: [{ target: "whatsapp" }, { target: "contact" }] });
  }
  if (has(t, /shipping|deliver|dispatch|courier|stock|available quantity|discount|offer|coupon|sale|review|rating|return|refund|exchange|\bcod\b|cash on delivery|warranty|size|dimension|material|weight|how long/)) {
    return reply({ text: FAQ.unknown, intent: "faq", actions: [{ target: "whatsapp" }] });
  }

  // Parse search filters
  const category = detectCategory(t);
  const price = parsePrice(t);
  const hasPrice = Object.keys(price).length > 0;
  const gift = has(t, /\bgifts?\b|\bpresent\b|\bfriend|birthday|anniversary|\bmom\b|\bmother|sister|brother|\bwife|girlfriend|someone special|rakhi|diwali/);
  const cheap = has(t, /\b(cheap|cheapest|affordable|budget friendly|low price|inexpensive|pocket friendly|lowest)\b/);
  const custom = has(t, /custom|personali[sz]|my name|her name|his name|initials?|engrav|made to order|my own design|own design|monogram/);

  // Custom order detection
  if (custom) {
    const filters: SearchFilters = { category, ...price, customizableOnly: true };
    const products = searchProducts(PRODUCTS, filters);
    return reply({
      text: products.length
        ? `${FAQ.customIntro} These products can also be personalised:`
        : FAQ.customIntro,
      intent: "custom_order",
      productIds: products.map((p) => p.id),
      reasons: recommendationReasons(products, gift),
      actions: [{ target: "custom_order" }, { target: "whatsapp" }],
      context: { filters, gift },
    });
  }

  // Named product
  const named = matchProductsByName(t);
  if (named.length && !hasPrice) {
    const best = named[0]!;
    const detailAsk = has(t, /tell me|about|details?|info|describe|what is|price of|how much/);
    if (detailAsk || best.score >= 2 || named.length === 1) return productDetails(best.product);
  }

  // Merge with the previous turn's context
  const prev = context.filters ?? {};
  let filters: SearchFilters = { category, ...price };
  let isGift = gift;
  const shortMsg = t.split(/\s+/).length <= 4;
  if (hasPrice && !category) {
    filters = { ...filters, category: prev.category, customizableOnly: prev.customizableOnly };
    isGift = gift || Boolean(context.gift);
  } else if (category && !hasPrice && shortMsg && !context.awaiting) {
    filters = { ...filters, minPrice: prev.minPrice, maxPrice: prev.maxPrice, aroundPrice: prev.aroundPrice };
  }
  if (cheap && !hasPrice) filters.maxPrice = 100;

  const wantsBrowse = has(t, /\b(show|see|have|got|list|browse|display|view|any)\b/);
  const priced = filters.maxPrice !== undefined || filters.minPrice !== undefined || filters.aroundPrice !== undefined;

  // Ask a simple question when the request is unclear
  if ((isGift || (category && !wantsBrowse)) && !priced) {
    return reply({
      text: isGift ? "Sure! What's your approximate budget?" : "Sure! What's your budget?",
      intent: "clarify",
      quickReplies: BUDGET_CHIPS,
      context: { filters, gift: isGift, awaiting: "budget" },
    });
  }

  if (hasFilters(filters)) {
    const intent = isGift ? "gift" : filters.category && !priced ? "category_search" : priced && !filters.category ? "price_search" : "product_search";
    const actions: NavAction[] = filters.category ? [{ target: "shop", category: filters.category }] : [{ target: "shop" }];
    const r = showResults(filters, isGift, undefined, actions);
    return { ...r, intent };
  }

  if (has(t, /\b(shop|products?|items?|collection|catalog(ue)?|everything|what do you (sell|have))\b/)) {
    return showResults({}, false, "Here's everything in our shop right now:", [{ target: "shop" }, { target: "categories" }]);
  }

  return reply({
    text: "I'm not sure I understood that. You can ask me things like \"earrings under ₹200\", \"a gift for my friend\" or \"a custom keychain\".",
    intent: "unknown",
    quickReplies: ["Shop Products", "Under ₹150", "Custom Order", "Contact Us"],
  });
}

function showResults(filters: SearchFilters, gift: boolean, text: string | undefined, actions: NavAction[]): Reply {
  const products = searchProducts(PRODUCTS, filters);
  const context: ConversationContext = { filters, gift };
  if (!products.length) {
    const close = closestProducts(PRODUCTS, filters);
    return reply({
      text: `I couldn't find ${describeFilters(filters, gift)} right now. Here are the closest options:`,
      intent: "product_search",
      productIds: close.map((p) => p.id),
      reasons: recommendationReasons(close, gift),
      actions,
      context,
    });
  }
  return reply({
    text: text ?? `Sure! Here are some ${describeFilters(filters, gift)}:`,
    intent: "product_search",
    productIds: products.map((p) => p.id),
    reasons: recommendationReasons(products, gift),
    actions,
    context,
  });
}

function productDetails(p: Product): Reply {
  return reply({
    text: `Here's the ${p.name} (Product ID ${p.id}).${p.customizable ? " It can be personalised." : ""}`,
    intent: "product_details",
    productIds: [p.id],
    actions: [{ target: "shop", category: p.category }],
    context: { filters: { category: p.category } },
  });
}
