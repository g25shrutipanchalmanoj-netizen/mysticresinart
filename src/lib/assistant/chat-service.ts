/**
 * Client chat service: the only thing the chat UI talks to.
 * Sends the conversation to the server; if the network fails, answers locally
 * with the rule-based engine so the assistant keeps working.
 */
import type { CartLine } from "@/lib/cart";

import { askMysticAssistant } from "./assistant.functions";
import { runFallback } from "./engine";
import { FALLBACK_NOTICE, type AssistantReply, type ChatTurn, type ConversationContext } from "./types";

export async function sendToAssistant(
  history: ChatTurn[],
  cart: CartLine[],
  context: ConversationContext,
): Promise<AssistantReply> {
  try {
    return await askMysticAssistant({ data: { history, cart, context } });
  } catch {
    const lastUser = [...history].reverse().find((t) => t.role === "user")?.text ?? "";
    return { ...runFallback(lastUser, context), mode: "fallback", notice: FALLBACK_NOTICE };
  }
}
