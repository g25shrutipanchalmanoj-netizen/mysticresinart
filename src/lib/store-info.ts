/** Store contact and payment settings, shared by every page and the assistant. */

export const STORE_NAME = "Mystic Resin Art";
export const WHATSAPP_DISPLAY = "+91 9082389302";
export const WHATSAPP_NUMBER = "919082389302"; // wa.me format, no plus sign

/**
 * PLACEHOLDER — replace with the real UPI ID before going live.
 * Checkout shows a warning while this is still the placeholder.
 */
export const UPI_ID = "yourname@upi";
export const UPI_IS_PLACEHOLDER = UPI_ID === "yourname@upi";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_HELP_MESSAGE = "Hello Mystic Resin Art, I need help with an order.";

export function upiPayLink(amount: number, note: string): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: STORE_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}
