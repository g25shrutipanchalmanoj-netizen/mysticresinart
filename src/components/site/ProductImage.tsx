import logo from "@/assets/mystic-assistant-logo.png";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

/** Shows the product photo, or a soft branded tile until a photo is uploaded. */
export function ProductImage({ product, className, compact = false }: { product: Product; className?: string; compact?: boolean }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${product.name} — photo coming soon`}
      className={cn("bg-tile relative flex h-full w-full flex-col items-center justify-center gap-2", className)}
    >
      <img src={logo} alt="" width={256} height={256} className={cn("opacity-70", compact ? "h-7 w-7" : "h-16 w-16")} />
      {!compact && <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Photo coming soon</span>}
    </div>
  );
}
