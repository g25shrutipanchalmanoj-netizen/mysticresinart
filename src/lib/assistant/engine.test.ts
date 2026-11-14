import { describe, expect, it } from "vitest";

import { getProduct } from "@/data/products";
import { whatsappLink } from "@/lib/store-info";

import { parsePrice, runFallback } from "./engine";

const prices = (ids: string[]) => ids.map((id) => getProduct(id)!.price);
const cats = (ids: string[]) => ids.map((id) => getProduct(id)!.category);

describe("Mystic Assistant fallback rules", () => {
  it("'Show product 10013' shows Galaxy Glitz Oxidized Jhumkas at ₹249", () => {
    const r = runFallback("Show product 10013");
    expect(r.productIds).toEqual(["10013"]);
    expect(getProduct("10013")).toMatchObject({ name: "Galaxy Glitz Oxidized Jhumkas", price: 249 });
  });

  it("'Tell me about the Gold Leaf Bracelet' shows product 10019 at ₹249", () => {
    const r = runFallback("Tell me about the Gold Leaf Bracelet");
    expect(r.intent).toBe("product_details");
    expect(r.productIds).toEqual(["10019"]);
    expect(getProduct("10019")!.price).toBe(249);
  });

  it("'I want something under 150' only shows products at ₹150 or below", () => {
    const r = runFallback("I want something under 150");
    expect(r.productIds.length).toBeGreaterThan(0);
    expect(prices(r.productIds).every((p) => p <= 150)).toBe(true);
  });

  it("'I want earrings under ₹200' combines category AND price", () => {
    const r = runFallback("I want earrings under ₹200");
    expect(r.productIds.length).toBeGreaterThan(0);
    expect(cats(r.productIds).every((c) => c === "earrings")).toBe(true);
    expect(prices(r.productIds).every((p) => p <= 200)).toBe(true);
  });

  it("'Do you have keychains?' shows keychains", () => {
    const r = runFallback("Do you have keychains?");
    expect(r.productIds.length).toBeGreaterThan(0);
    expect(cats(r.productIds).every((c) => c === "keychains")).toBe(true);
  });

  it("'I need a gift' asks for a budget with the four budget buttons", () => {
    const r = runFallback("I need a gift");
    expect(r.intent).toBe("clarify");
    expect(r.quickReplies).toEqual(["Under ₹100", "₹100–₹200", "₹200–₹500", "₹500+"]);
  });

  it("remembers 'earrings' from the previous turn when the customer then says 'Under 150'", () => {
    const first = runFallback("I want earrings");
    expect(first.intent).toBe("clarify");
    const second = runFallback("Under 150", first.context);
    expect(second.productIds.length).toBeGreaterThan(0);
    expect(cats(second.productIds).every((c) => c === "earrings")).toBe(true);
    expect(prices(second.productIds).every((p) => p <= 150)).toBe(true);
  });

  it("'I want a personalized gift under ₹150' shows only customisable products ≤ ₹150", () => {
    const r = runFallback("I want a personalized gift under ₹150");
    expect(r.intent).toBe("custom_order");
    expect(r.productIds.length).toBeGreaterThan(0);
    for (const id of r.productIds) {
      expect(getProduct(id)!.customizable).toBe(true);
      expect(getProduct(id)!.price).toBeLessThanOrEqual(150);
    }
  });

  it("custom requests point to the Custom Order page", () => {
    for (const msg of ["I want my name on a keychain", "Can you make something with my initials?", "I want a custom resin design"]) {
      const r = runFallback(msg);
      expect(r.intent).toBe("custom_order");
      expect(r.actions.map((a) => a.target)).toContain("custom_order");
    }
  });

  it("budget buttons parse to the right price ranges", () => {
    expect(parsePrice("under ₹100")).toEqual({ maxPrice: 100 });
    expect(parsePrice("₹100–₹200")).toEqual({ minPrice: 100, maxPrice: 200 });
    expect(parsePrice("₹500+")).toEqual({ minPrice: 500 });
    expect(parsePrice("around ₹100")).toEqual({ aroundPrice: 100 });
  });

  it("questions about shipping never get an invented answer", () => {
    const r = runFallback("How long does shipping take?");
    expect(r.text).toContain("I don't have that information yet");
    expect(r.text).toContain("+91 9082389302");
  });

  it("WhatsApp links go to +91 9082389302", () => {
    expect(whatsappLink("hi")).toBe("https://wa.me/919082389302?text=hi");
  });
});
