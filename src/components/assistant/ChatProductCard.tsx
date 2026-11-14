import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { ProductImage } from "@/components/site/ProductImage";
import { Button } from "@/components/ui/button";
import { formatPrice, getProduct } from "@/data/products";
import { useCart } from "@/lib/cart";

/** Product card rendered from the live catalogue — never from AI text. */
export function ChatProductCard({ productId, reason, onNavigate }: { productId: string; reason?: string | undefined; onNavigate: () => void }) {
  const cart = useCart();
  const product = getProduct(productId);
  if (!product) return null;
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-2.5 shadow-soft">
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        onClick={onNavigate}
        className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl"
      >
        <ProductImage product={product} compact />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold leading-snug">{product.name}</p>
        <p className="text-sm font-bold">
          {formatPrice(product.price)}
          <span className="ml-2 text-[11px] font-normal text-muted-foreground">ID {product.id}</span>
        </p>
        {reason && <p className="text-xs text-muted-foreground">{reason}</p>}
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Button asChild size="xs" variant="outline">
            <Link to="/product/$productId" params={{ productId: product.id }} onClick={onNavigate}>
              View Product
            </Link>
          </Button>
          <Button
            size="xs"
            onClick={() => {
              cart.add(product.id);
              toast.success(`${product.name} added to cart`);
            }}
          >
            Add to Cart
          </Button>
          {product.customizable && (
            <Button asChild size="xs" variant="gold">
              <Link to="/custom-order" search={{ product: product.id }} onClick={onNavigate}>
                Custom Order
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
