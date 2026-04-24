import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductActions from '@/components/ui/ProductActions';

async function getProduct(id) {
  // Use no-store to fetch fresh data
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Fetch product failed:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct((await params).id);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: `${product.name} | Biti's Style`,
    description: `Buy ${product.name} at the best price. High quality footwear.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct((await params).id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    );
  }

  const { name, price, discount_price, images, sizes, color, category, tags } = product;
  const currentPrice = discount_price || price;
  const hasDiscount = !!discount_price;

  return (
    <article className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 w-full">
      {/* Breadcrumb */}
      <nav className="text-sm text-foreground/60 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">Products</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Product Images (Gallery) */}
        <section className="flex flex-col gap-4">
          <div className="relative aspect-square w-full bg-accent rounded-2xl overflow-hidden">
            {/* Badges */}
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
              {tags?.map(tag => (
                <span key={tag} className="bg-primary text-white text-sm font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            <img 
              src={images[0]} 
              alt={`${name} main view`} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.slice(1).map((img, idx) => (
              <div key={idx} className="aspect-square bg-accent rounded-xl overflow-hidden">
                <img src={img} alt={`${name} view ${idx+2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Product Info & Actions */}
        <section className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
              {name}
            </h1>
            <div className="flex items-end gap-4">
              <span className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-foreground/50 line-through mb-1">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-foreground/10 my-6"></div>

          <ProductActions product={product} />

        </section>
      </div>
    </article>
  );
}
