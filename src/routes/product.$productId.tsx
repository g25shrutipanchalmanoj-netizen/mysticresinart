import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageCircleHeart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import { Button } from "@/components/ui/button";
import { formatPrice, getCategory, getProduct, productsInCategory } from "@/data/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product not found — Mystic Resin Art" }, { name: "robots", content: "noindex" }] };
    const title = `${p.name} — ${formatPrice(p.price)} | Mystic Resin Art`;
    const description = `${p.name}, handmade resin ${getCategory(p.category)?.name.toLowerCase()} for ${formatPrice(p.price)}.${p.customizable ? " Can be personalised." : ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold">We couldn't find that piece</h1>
      <Button asChild className="mt-6">
        <Link to="/shop">Back to shop</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const cart = useCart();
  const category = getCategory(product.category);
  const related = productsInCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-muted-foreground">
        <Link to="/shop">Shop</Link> /{" "}
        <Link to="/shop" search={{ category: product.category }}>
          {category?.name}
        </Link>
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-[2rem] border border-border shadow-soft">
          <ProductImage product={product} />
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-foreground">{category?.name}</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{product.name}</h1>
          <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
          <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
            <dt className="text-muted-foreground">Product ID</dt>
            <dd className="font-semibold">{product.id}</dd>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="font-semibold">{category?.name}</dd>
            <dt className="text-muted-foreground">Personalisable</dt>
            <dd className="font-semibold">{product.customizable ? "Yes" : "No"}</dd>
          </dl>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                cart.add(product.id);
                toast.success(`${product.name} added to cart`);
              }}
            >
              <ShoppingBag /> Add to Cart
            </Button>
            {product.customizable && (
              <Button asChild size="lg" variant="gold">
                <Link to="/custom-order" search={{ product: product.id }}>
                  <MessageCircleHeart /> Personalise it
                </Link>
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Pay securely with UPI at checkout. For personalisation, send your details through the Custom Order page on WhatsApp.
          </p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-semibold">More {category?.name.toLowerCase()}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
