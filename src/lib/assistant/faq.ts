import { WHATSAPP_DISPLAY } from "@/lib/store-info";

export const FAQ = {
  about:
    "Mystic Resin Art is a handmade resin-art brand offering artistic, personalized and decorative resin products.",
  normalOrder:
    "Choose a product, add it to your cart, proceed to checkout and complete payment using UPI.",
  customOrder:
    "Use the Custom Order page to submit your requirements. Your request will be sent to Mystic Resin Art through WhatsApp.",
  whatsapp: `Our WhatsApp number is ${WHATSAPP_DISPLAY}.`,
  customize:
    "For products marked as customizable, you can request personalization. For a completely custom design, use the Custom Order option.",
  contact: `Contact Mystic Resin Art through WhatsApp at ${WHATSAPP_DISPLAY}.`,
  unknown: `I don't have that information yet. You can contact Mystic Resin Art on WhatsApp at ${WHATSAPP_DISPLAY}.`,
  customIntro:
    "Sure! For custom designs, you can send your requirements directly to Mystic Resin Art on WhatsApp.",
} as const;

export const WELCOME_MESSAGE =
  "Hi! I'm Mystic Assistant. I can help you find the perfect resin-art product, check prices, find categories, or help you place a custom order.";

export const WELCOME_QUICK_REPLIES = [
  "Shop Products",
  "Find a Product",
  "Custom Order",
  "Help with Cart",
  "Contact Us",
];
