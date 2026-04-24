'use client';
import useProducts from '@/hooks/useProducts';
import FilterSidebar from '@/components/plp/FilterSidebar';
import ProductGrid from '@/components/plp/ProductGrid';
import { SlidersHorizontal } from 'lucide-react';
import { useState, Suspense } from 'react';

function ProductsContent() {
  const {
    products,
    isLoading,
    filters,
    updateFilter,
    sort,
    setSort,
    page,
    setPage,
    totalPages
  } = useProducts();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground">
            All Footwear
          </h1>
          <p className="text-foreground/60 mt-1">
            {products ? products.length : 0} products
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden flex items-center gap-2 border px-4 py-2 rounded-lg font-medium"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60 hidden sm:inline-block">Sort by:</span>
            <select 
              className="border border-foreground/20 rounded-lg px-4 py-2 bg-background focus:ring-primary focus:border-primary outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Container */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} w-full lg:w-auto`}>
          <FilterSidebar filters={filters} updateFilter={updateFilter} />
        </div>

        {/* Main Grid */}
        <div className="flex-1 flex flex-col gap-8">
          <ProductGrid products={products} isLoading={isLoading} />
          
          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-foreground/5 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium">Page {page} of {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-foreground/5 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-foreground/60">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
