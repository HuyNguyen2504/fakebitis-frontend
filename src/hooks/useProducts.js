import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function useProducts() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    const init = {};
    if (initialCategory) init.category = [initialCategory];
    if (initialSearch) init.search = initialSearch;
    return init;
  });
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setPage(1); // Reset page on filter change
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', 12);
        
        if (sort) queryParams.append('sort', sort);
        
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value);
          }
        });

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiBase}/products?${queryParams.toString()}`);
        const data = await res.json();
        
        setProducts(data.data);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        // Add a slight delay just to show the skeleton animation clearly (simulating network latency)
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchProducts();
  }, [filters, sort, page]);

  return {
    products,
    isLoading,
    filters,
    updateFilter,
    sort,
    setSort,
    page,
    setPage,
    totalPages
  };
}
