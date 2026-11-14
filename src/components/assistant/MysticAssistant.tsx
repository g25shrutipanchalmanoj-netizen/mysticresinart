import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import logo from "@/assets/mystic-assistant-logo.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { sendToAssistant } from "@/lib/assistant/chat-service";
import { WELCOME_MESSAGE, WELCOME_QUICK_REPLIES } from "@/lib/assistant/faq";
import type { AssistantReply, ChatTurn, ConversationContext } from "@/lib/assistant/types";
import { useCart } from "@/lib/cart";
import { WHATSAPP_HELP_MESSAGE, whatsappLink } from "@/lib/store-info";
import { cn } from "@/lib/utils";

import { ChatCartSummary } from "./ChatCartSummary";
import { ChatNavButtons } from "./ChatNavButtons";
import { ChatProductCard } from "./ChatProductCard";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: Omit<AssistantReply, "text" | "context">;
}

interface SessionState {
  messages: ChatMessage[];
  context: ConversationContext;
}

const SESSION_KEY = "mystic-assistant-session-v1";
const INPUT_ID = "mystic-assistant-input";
const BOTTOM_ACTIONS: { label: string; send: string }[] = [
  { label: "Shop", send: "Shop Products" },
  { label: "Under ₹150", send: "Show me products under ₹150" },
  { label: "Earrings", send: "Show me earrings" },
  { label: "Keychains", send: "Show me keychains" },
  { label: "Custom Order", send: "I want a custom order" },
];

const welcome = (): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  text: WELCOME_MESSAGE,
  reply: {
    intent: "greeting",
    productIds: [],
    reasons: {},
    actions: [],
    quickReplies: WELCOME_QUICK_REPLIES,
    showCart: false,
    mode: "fallback",
  },
});

const newId = () => Math.random().toString(36).slice(2, 10);

export function MysticAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome()]);
  const [context, setContext] = useState<ConversationContext>({});
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cart = useCart();
  const navigate = useNavigate();
  const stateRef = useRef({ messages, context });
  stateRef.current = { messages, context };

  // Session-only memory: survives page navigation and reloads in this tab, never stored on a server.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SessionState;
        if (saved.messages?.length) setMessages(saved.messages);
        setContext(saved.context ?? {});
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ messages, context }));
  }, [messages, context, loaded]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => document.getElementById(INPUT_ID)?.focus());
  }, []);

  useEffect(() => {
    if (open) focusInput();
  }, [open, focusInput]);

  const closeOnMobile = useCallback(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 1000);
      if (!text || pending) return;
      const userMsg: ChatMessage = { id: newId(), role: "user", text };
      const nextMessages = [...stateRef.current.messages, userMsg];
      setMessages(nextMessages);
      setPending(true);

      const history: ChatTurn[] = nextMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, text: m.text, productIds: m.reply?.productIds }));

      const reply = await sendToAssistant(history, cart.lines, stateRef.current.context);

      let replyText = reply.text;
      if (reply.showCart && cart.count === 0) {
        replyText = "Your cart is empty right now. Would you like to see some products?";
      }
      const { text: _t, context: nextContext, ...rest } = reply;
      void _t;
      setMessages((prev) => [...prev, { id: newId(), role: "assistant", text: replyText, reply: rest }]);
      setContext(nextContext);
      setPending(false);
      focusInput();

      if (reply.intent === "checkout" && cart.count > 0) {
        closeOnMobile();
        navigate({ to: "/checkout" });
      }
    },
    [pending, cart.lines, cart.count, focusInput, navigate, closeOnMobile],
  );

  const handleSubmit = (message: PromptInputMessage) => {
    void send(message.text ?? "");
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Mystic Assistant" : "Open Mystic Assistant"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-gold/60 bg-card py-2 pl-2 pr-4 shadow-float transition-transform hover:scale-105",
          !open && "animate-gentle-pulse",
          open && "max-sm:hidden",
        )}
      >
        <img src={logo} alt="" width={256} height={256} className="h-10 w-10" />
        <span className="text-sm font-semibold">{open ? "Close" : "Ask Mystic"}</span>
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Mystic Assistant chat"
          className="animate-float-in fixed inset-2 z-50 flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-float sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(660px,calc(100vh-8rem))] sm:w-[390px]"
        >
          {/* Header */}
          <header className="bg-hero flex items-center gap-3 border-b border-border px-4 py-3">
            <img src={logo} alt="" width={256} height={256} className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold leading-none">Mystic Assistant</p>
              <p className="mt-1 text-xs text-muted-foreground">Your resin-art shopping helper</p>
            </div>
            <Button asChild size="xs" variant="whatsapp">
              <a href={whatsappLink(WHATSAPP_HELP_MESSAGE)} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </header>

          {/* Transcript */}
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-5 px-4 py-4">
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent className="group-[.is-user]:rounded-2xl group-[.is-user]:rounded-br-md group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground">
                    {m.role === "assistant" ? (
                      <>
                        {m.reply?.notice && (
                          <p className="rounded-xl bg-gold-soft px-3 py-2 text-xs text-gold-foreground">{m.reply.notice}</p>
                        )}
                        <MessageResponse>{m.text}</MessageResponse>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}
                  </MessageContent>
                  {m.role === "assistant" && m.reply && (
                    <div className="flex w-full flex-col gap-2">
                      {m.reply.productIds.map((id) => (
                        <ChatProductCard key={id} productId={id} reason={m.reply?.reasons[id]} onNavigate={closeOnMobile} />
                      ))}
                      {m.reply.showCart && cart.count > 0 && <ChatCartSummary onNavigate={closeOnMobile} />}
                      <ChatNavButtons actions={m.reply.actions} onNavigate={closeOnMobile} />
                      {m.id === lastAssistantId && m.reply.quickReplies.length > 0 && !pending && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.reply.quickReplies.map((q) => (
                            <Button key={q} size="xs" variant="blush" onClick={() => void send(q)}>
                              {q}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Message>
              ))}
              {pending && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>Finding the perfect piece…</Shimmer>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Quick actions + composer */}
          <div className="border-t border-border bg-card px-3 pb-3 pt-2">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {BOTTOM_ACTIONS.map((a) => (
                <Button
                  key={a.label}
                  size="xs"
                  variant="chip"
                  className="shrink-0"
                  disabled={pending}
                  onClick={() => void send(a.send)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
            <PromptInput onSubmit={handleSubmit} className="rounded-2xl">
              <PromptInputTextarea
                id={INPUT_ID}
                placeholder="Ask about earrings, gifts, prices…"
                className="min-h-11 text-sm"
                maxLength={1000}
              />
              <PromptInputFooter className="justify-end py-1.5">
                <PromptInputSubmit status={pending ? "submitted" : "ready"} disabled={pending} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      )}
    </>
  );
}
