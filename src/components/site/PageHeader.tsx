import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-hero border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-foreground">{eyebrow}</p>}
        <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
