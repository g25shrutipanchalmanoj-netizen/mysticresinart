import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatPrice, getCategory, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";

import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1">
      <Link to="/product/$productId" params={{ productId: product.id }} className="block aspect-square overflow-hidden">
        <ProductImage product={product} className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span>{getCategory(product.category)?.name}</span>
          {product.customizable && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-gold-foreground">Personalisable</span>}
        </div>
        <Link to="/product/$productId" params={{ productId: product.id }}>
          <h3 className="text-xl font-semibold leading-tight">{product.name}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <Button
            size="sm"
            onClick={() => {
              cart.add(product.id);
              toast.success(`${product.name} added to cart`);
            }}
          >
            <ShoppingBag /> Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
